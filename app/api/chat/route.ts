import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { getServerSession } from "next-auth";
import {
  AccessRequestResponse,
  AccessRequestsApi,
  AccessRequestsApiCreateAccessRequestRequest,
  AccessRequestType,
  Configuration,
  ConfigurationParameters,
  Paginator,
  RequestableObjectsApi,
  Search,
  SearchApi,
} from "sailpoint-api-client";
import { z } from "zod";
import { authOptions } from "../auth/authOptions";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  console.log("accessToken", session.accessToken);

  const configurationParams: ConfigurationParameters = {
    accessToken: session?.accessToken,
    baseurl: process.env.ISC_BASE_API_URL,
  };
  const apiConfig = new Configuration(configurationParams);

  const { messages } = await req.json();
  const result = streamText({
    model: openai("gpt-4o"),
    messages,
    system: `\
          You are a friendly assistant that helps the user with below tasks: 
          
          1. Search objects on SailPoint Identity Secure Cloud (ISC)
          2. Help user requesting access(es) for certain requestees(identities/users) on SailPoint Identity Secure Cloud
          3. Help user to check the status of access request(s) on SailPoint Identity Secure Cloud
      
          For submit access request, please guide the user in the below flow for access request: 
            1. Ask user who should be the requestee.
            2. Ask user which access object(s) to be requested.
            3. Submit access request with tools submitAccessRequest.
          `,
    tools: {
      submitAccessRequest: {
        description: "submit access request",
        parameters: z.object({
          requestedFor: z
            .array(z.string())
            .describe("array of requestee identity's id attribute"),
          requestedItems: z
            .array(
              z.object({
                type: z
                  .literal("ACCESS_PROFILE")
                  .or(z.literal("ENTITLEMENT"))
                  .or(z.literal("ROLE"))
                  .describe(
                    "access object type, must be one of ACCESS_PROFILE, ENTITLEMENT, ROLE"
                  ),
                id: z.string().describe("access object id attribute"),
              })
            )
            .describe(
              "array of requestItem which contains the access object type and corresponding id attribute"
            ),
        }),
        execute: async ({ requestedFor, requestedItems }) => {
          try {
            console.log("Starting submitAccessRequest...");

            const api = new AccessRequestsApi(apiConfig);

            const requestBody: AccessRequestsApiCreateAccessRequestRequest = {
              accessRequest: {
                requestedFor: requestedFor,
                requestType: AccessRequestType.GrantAccess,
                requestedItems: requestedItems,
              },
            };

            console.log("Request body:", JSON.stringify(requestBody, null, 2));

            const response = await api.createAccessRequest(requestBody);

            if (!response.status.toString().startsWith("2")) {
              throw new Error(
                `Request failed with status: ${response.status.toString()}`
              );
            }

            if (!response.data) {
              throw new Error("No response received from API");
            }

            // Type assertion for the response
            const accessRequestResponse =
              response.data as AccessRequestResponse;

            if (accessRequestResponse.existingRequests) {
              throw new Error("request already exists");
            }

            if (!accessRequestResponse.newRequests) {
              throw new Error("No new requests in response");
            }

            return {
              status: "success",
              message: `access request(s) created: ${accessRequestResponse.newRequests
                .map((request) => request.accessRequestIds)
                .flat()}`,
            };
          } catch (error: any) {
            console.error("Error in submitAccessRequest:", error);
            if (error.response) {
              console.error("Error response data:", error.response.data);
              console.error("Error response status:", error.response.status);
              console.error("Error response headers:", error.response.headers);
            }
            if (error instanceof Error) {
              return {
                status: "error",
                message: `Failed to submit access request: ${error.message}`,
              };
            }
            return {
              status: "error",
              message: "Failed to submit access request: Unknown error",
            };
          }
        },
      },
      searchIdentitiesOnName: {
        description: "Search identities based on keyword",
        parameters: z.object({
          keyword: z.string().describe("Search keyword"),
        }),
        execute: async ({ keyword }) => {
          try {
            console.log("searchIdentitiesOnName...");
            console.log("keyword", keyword);
            const offset = 0;
            const limit = 25;
            let searchApiObj: Search = {
              indices: ["identities"],
              query: {
                query: `name:*${keyword}* || displayName:*${keyword}*`,
              },
              sort: ["+name"],
              queryResultFilter: {
                includes: ["id", "name", "displayName", "email"],
                excludes: ["stacktrace", "_type", "type", "_version"],
              },
            };
            const api = new SearchApi(apiConfig);
            const res = await Paginator.paginate(
              api,
              api.searchPost,
              {
                limit: limit,
                offset: offset,
                count: true,
                search: searchApiObj,
              },
              limit
            );
            const total = parseInt((await res).headers["x-total-count"]);
            const objects = res.data.map((item) => ({
              ...item,
            }));
            console.log("total", total);
            console.log("objects", objects);
            return objects;
          } catch (error: any) {
            console.error("Error in submitAccessRequest:", error);
            if (error.response) {
              console.error("Error response data:", error.response.data);
              console.error("Error response status:", error.response.status);
              console.error("Error response headers:", error.response.headers);
            }
            if (error instanceof Error) {
              return {
                message: `Failed to submit access request: ${error.message}`,
              };
            }
            return {
              message: "Failed to submit access request: Unknown error",
            };
          }
        },
      },
      searchAccessObject: {
        description: "Search access objects(roles) on name",
        parameters: z.object({
          identityId: z
            .string()
            .describe(
              "Identity ID, if multiple identities were request then leave this parameter null"
            ),
          keyword: z.string().describe("Search keyword"),
        }),
        execute: async ({ identityId, keyword }) => {
          try {
            console.log("searchAccessObject...");
            console.log("identityId", identityId);
            console.log("keyword", keyword);
            const api = new RequestableObjectsApi(apiConfig);
            const requestParams = {
              ...(identityId ? { identityId } : {}),
              types: ["ROLE"],
              statuses: ["AVAILABLE"],
              term: keyword,
            };
            console.log("requestParams", requestParams);
            const response = await api.listRequestableObjects();
            console.log("API Response:", response.data);
            return response.data;
          } catch (error: any) {
            console.error("Error in searchAccessObject:", error);
            return {
              message: `Failed to search access object: ${error.message}`,
            };
          }
        },
      },
      checkAccessRequestStatus: {
        description: "Check the status of pending access request(s)",
        parameters: z.object({}),
        execute: async ({}) => {
          try {
            const api = new AccessRequestsApi(apiConfig);
            const response = await api.listAccessRequestStatus({
              requestState: "EXECUTING",
            });
            console.log("API Response:", response.data);
            return response.data;
          } catch (error: any) {
            console.error("Error in submitAccessRequest:", error);
            if (error.response) {
              console.error("Error response data:", error.response.data);
              console.error("Error response status:", error.response.status);
              console.error("Error response headers:", error.response.headers);
            }
            if (error instanceof Error) {
              return {
                status: "error",
                message: `Failed to submit access request: ${error.message}`,
              };
            }
            return {
              status: "error",
              message: "Failed to submit access request: Unknown error",
            };
          }
        },
      },
    },
  });

  return result.toDataStreamResponse();
}
