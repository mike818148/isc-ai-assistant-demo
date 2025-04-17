import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { RequestedItemStatus } from "sailpoint-api-client";

export default function AccessRequestCard({
  request,
}: {
  request: RequestedItemStatus;
}) {
  const activePhase = request.accessRequestPhases?.find(
    (p) => p.state === "EXECUTING"
  );

  return (
    <Card className="w-full max-w-md shadow-lg rounded-2xl border border-gray-200">
      <CardContent className="p-4 space-y-2">
        <h2 className="text-lg font-semibold">{request.name}</h2>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Requested For:</span>{" "}
          {request.requestedFor?.name}
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">State:</span> {request.state}
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Request Type:</span>{" "}
          {request.requestType}
        </p>
        {activePhase && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Executing Phase:</span>{" "}
            {activePhase.name}
          </p>
        )}

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="mt-2">
              View Details
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogTitle>{request.name}</DialogTitle>
            <p className="mb-4 text-sm text-muted-foreground">
              {request.description}
            </p>
            <div className="space-y-1 text-sm">
              <div>
                <strong>Type:</strong> {request.type}
              </div>
              <div>
                <strong>Request Type:</strong> {request.requestType}
              </div>
              <div>
                <strong>State:</strong> {request.state}
              </div>
              <div>
                <strong>Executing Phase:</strong> {activePhase?.name}
              </div>
              <div>
                <strong>Requested For:</strong> {request.requestedFor?.name}
              </div>
              <div>
                <strong>Approver:</strong> Aaron Smith (PENDING)
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
