type UIRefreshOperation = "create" | "update" | "delete" | "restore" | "purge";

interface UIRefreshDetail {
  operation: UIRefreshOperation;
  scope: string;
  id?: number;
}

export const emitUIRefresh = (detail: UIRefreshDetail): void => {
  if (typeof window === "undefined") {
    return;
  }

  const eventDetail = {
    ...detail,
    at: Date.now(),
  };

  window.dispatchEvent(
    new CustomEvent("app-data-changed", { detail: eventDetail }),
  );

  if (
    detail.operation === "delete" ||
    detail.operation === "restore" ||
    detail.operation === "purge"
  ) {
    window.dispatchEvent(
      new CustomEvent("folder-update", { detail: eventDetail }),
    );
    window.dispatchEvent(
      new CustomEvent("entity-update", { detail: eventDetail }),
    );
  }
};
