"use client";

import React, { useState } from "react";
import { Button, Badge } from "@startpoint/ui";
import { Eye } from "lucide-react";
import {
  SocialClaimReview,
  type SocialClaimEntry,
} from "./social-claim-review";

interface SocialClaimListProps {
  claims: SocialClaimEntry[];
}

const ACTION_TYPE_LABELS: Record<string, string> = {
  like_page: "Like Page",
  follow_page: "Follow Page",
  share_post: "Share Post",
};

type StatusFilter = "all" | "pending" | "verified" | "rejected";

export function SocialClaimList({ claims }: SocialClaimListProps) {
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all");
  const [selectedClaim, setSelectedClaim] = useState<SocialClaimEntry | null>(
    null
  );
  const [reviewOpen, setReviewOpen] = useState(false);

  const pendingCount = claims.filter((c) => c.status === "pending").length;

  const filteredClaims =
    activeFilter === "all"
      ? claims
      : claims.filter((c) => c.status === activeFilter);

  const statusBadge = (status: SocialClaimEntry["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Pending
          </Badge>
        );
      case "verified":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Verified
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Rejected
          </Badge>
        );
    }
  };

  const filterTabs: { label: string; value: StatusFilter }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Verified", value: "verified" },
    { label: "Rejected", value: "rejected" },
  ];

  const handleOpenReview = (claim: SocialClaimEntry) => {
    setSelectedClaim(claim);
    setReviewOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2">
        {filterTabs.map((tab) => (
          <Button
            key={tab.value}
            variant={activeFilter === tab.value ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(tab.value)}
          >
            {tab.label}
            {tab.value === "pending" && pendingCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 bg-yellow-100 text-yellow-800"
              >
                {pendingCount}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Table */}
      {filteredClaims.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="pb-3 font-medium">Client</th>
                <th className="pb-3 font-medium">Action</th>
                <th className="pb-3 font-medium">Username</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClaims.map((claim) => (
                <tr key={claim.id} className="border-b last:border-0">
                  <td className="py-3 text-sm">
                    <div>
                      <div className="font-medium">{claim.clientName}</div>
                      <div className="text-xs text-muted-foreground">
                        {claim.clientEmail}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-sm">
                    {ACTION_TYPE_LABELS[claim.action_type] ||
                      claim.action_type}
                  </td>
                  <td className="py-3 text-sm font-mono">
                    {claim.social_username || "-"}
                  </td>
                  <td className="py-3 text-sm">
                    {new Date(claim.created_at).toLocaleDateString("en-PH", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3 text-sm">{statusBadge(claim.status)}</td>
                  <td className="py-3 text-sm">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenReview(claim)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No claims match the selected filter.</p>
        </div>
      )}

      {/* Review Dialog */}
      {selectedClaim && (
        <SocialClaimReview
          claim={selectedClaim}
          open={reviewOpen}
          onOpenChange={(open) => {
            setReviewOpen(open);
            if (!open) setSelectedClaim(null);
          }}
        />
      )}
    </div>
  );
}
