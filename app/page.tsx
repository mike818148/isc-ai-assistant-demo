"use client";

import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Send, Bot, User, Plus } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { ToolInvocation } from "@ai-sdk/ui-utils";
import { IdentityCards } from "@/components/identity-cards";
import AccessItemCarousel from "@/components/access-item-carousel";
import Markdown from "react-markdown";
import StatusCard from "@/components/status-card";
import AccessRequestCard from "@/components/access-request-card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { RequestedItemStatus } from "sailpoint-api-client";
import { signOut, useSession } from "next-auth/react";

interface Message {
  id: string;
  role: "user" | "assistant" | "data" | "system";
  content: string;
  toolInvocations?: ToolInvocation[];
}

interface AccessItem {
  id: string;
  name: string;
  type: string;
}

export default function Chat() {
  const { data: session } = useSession();
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    setInput,
  } = useChat({
    api: "/api/chat",
    onError: (error) => {
      console.error(error);
    },
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    console.log("messages", messages);
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-6xl shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Chatbot
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">User:</span>
                <span className="font-medium">{session?.user?.name}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut()}
                className="flex items-center gap-2"
              >
                Logout
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMessages([])}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Conversation
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="h-[60vh] overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center text-gray-500">
              <div>
                <Bot className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Send a message to start chatting with the AI</p>
              </div>
            </div>
          ) : (
            messages.map((message: Message) => (
              <div
                key={message.id}
                className={`mb-4 flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start gap-2 max-w-[80%] ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full ${
                      message.role === "user" ? "bg-blue-500" : "bg-gray-200"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="h-5 w-5 text-white" />
                    ) : (
                      <Bot className="h-5 w-5 text-gray-700" />
                    )}
                  </div>
                  <div
                    className={`rounded-lg p-3 max-w-full overflow-x-auto ${
                      message.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {<Markdown>{message.content}</Markdown>}
                    {message.toolInvocations &&
                      message.toolInvocations.length > 0 && (
                        <div className="mt-2 text-sm">
                          <div className="font-semibold">Tool Results:</div>
                          {message.toolInvocations.map((toolInvocation) => (
                            <div
                              key={toolInvocation.toolCallId}
                              className="mt-1"
                            >
                              <div className="font-medium">
                                {toolInvocation.toolName}:
                              </div>
                              {toolInvocation.state === "result" &&
                                toolInvocation.result && (
                                  <>
                                    {toolInvocation.toolName ===
                                      "searchIdentitiesOnName" && (
                                      <IdentityCards
                                        identities={toolInvocation.result}
                                        onSubmit={(selectedIdentities) => {
                                          const markdownContent = `Request for below identities:\n\n${selectedIdentities
                                            .map(
                                              (identity) =>
                                                `- **${identity.displayName}** (${identity.name})\n  - Email: ${identity.email}\n  - ID: ${identity.id}`
                                            )
                                            .join("\n\n")}`;

                                          setInput(markdownContent);
                                          // Use setTimeout to ensure the input is set before submitting
                                          setTimeout(() => {
                                            const form =
                                              document.getElementById(
                                                "chat-form"
                                              ) as HTMLFormElement;
                                            if (form) {
                                              form.requestSubmit();
                                            }
                                          }, 0);
                                        }}
                                      />
                                    )}
                                    {toolInvocation.toolName ===
                                      "searchAccessObject" && (
                                      <AccessItemCarousel
                                        accessItems={toolInvocation.result}
                                        onSubmit={(selectedItemIds) => {
                                          const selectedItems =
                                            toolInvocation.result.filter(
                                              (item: AccessItem) =>
                                                selectedItemIds.includes(
                                                  item.id
                                                )
                                            );
                                          const markdownContent = `Request for below access items:\n\n${selectedItems
                                            .map(
                                              (item: AccessItem) =>
                                                `- **${item.name}**\n  - Type: ${item.type}\n  - ID: ${item.id}`
                                            )
                                            .join("\n\n")}`;

                                          setInput(markdownContent);
                                          // Use setTimeout to ensure the input is set before submitting
                                          setTimeout(() => {
                                            const form =
                                              document.getElementById(
                                                "chat-form"
                                              ) as HTMLFormElement;
                                            if (form) {
                                              form.requestSubmit();
                                            }
                                          }, 0);
                                        }}
                                      />
                                    )}
                                    {toolInvocation.toolName ===
                                      "submitAccessRequest" && (
                                      <StatusCard
                                        status={toolInvocation.result.status}
                                        message={toolInvocation.result.message}
                                      />
                                    )}
                                    {toolInvocation.toolName ===
                                      "checkAccessRequestStatus" && (
                                      <div className="w-full">
                                        <div className="flex items-center justify-between mb-4">
                                          <h2 className="text-xl font-semibold">
                                            Access Requests
                                          </h2>
                                        </div>

                                        {toolInvocation.result.length === 0 ? (
                                          <div className="text-center py-8 text-muted-foreground">
                                            No access requests found
                                          </div>
                                        ) : (
                                          <div className="relative">
                                            <ScrollArea className="w-full">
                                              <div className="flex gap-4 pb-4 pt-1 px-12">
                                                {toolInvocation.result.map(
                                                  (
                                                    request: RequestedItemStatus
                                                  ) => (
                                                    <AccessRequestCard
                                                      key={
                                                        request.accessRequestId
                                                      }
                                                      request={request}
                                                    />
                                                  )
                                                )}
                                              </div>
                                              <ScrollBar orientation="horizontal" />
                                            </ScrollArea>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </>
                                )}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="flex items-start gap-2 max-w-[80%]">
                <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-gray-200">
                  <Bot className="h-5 w-5 text-gray-700" />
                </div>
                <div className="rounded-lg bg-gray-200 p-3 text-gray-800">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        <CardFooter className="border-t p-4">
          <form
            id="chat-form"
            onSubmit={handleSubmit}
            className="flex w-full space-x-2"
          >
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-grow"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
