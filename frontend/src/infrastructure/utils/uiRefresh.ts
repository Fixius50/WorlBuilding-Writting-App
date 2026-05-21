type UIRefreshOperation = "create" | "update" | "delete" | "restore" | "purge";

interface UIRefreshDetail {
  operation: UIRefreshOperation;
  scope: string;
  id?: number;
  isRemote?: boolean;
}

const channel = typeof window !== "undefined" ? new BroadcastChannel("worldbuilding-ui-sync") : null;

export const emitUIRefresh = (detail: UIRefreshDetail): void => {
  const isWindowUndefined = typeof window === "undefined";
  switch (isWindowUndefined) {
    case true:
      break;
    default: {
      const eventDetail = {
        ...detail,
        at: Date.now(),
      };

      window.dispatchEvent(
        new CustomEvent("app-data-changed", { detail: eventDetail }),
      );
      window.dispatchEvent(
        new CustomEvent("folder-update", { detail: eventDetail }),
      );
      window.dispatchEvent(
        new CustomEvent("entity-update", { detail: eventDetail }),
      );

      const isLocal = !detail.isRemote && channel !== null;
      switch (isLocal) {
        case true:
          if (channel) {
            channel.postMessage(detail);
          }
          break;
        default:
          break;
      }
    }
  }
};

// Escucha activa del canal para propagar a la pestaña local
switch (channel !== null) {
  case true:
    if (channel) {
      channel.onmessage = (event: MessageEvent<UIRefreshDetail>): void => {
        emitUIRefresh({
          ...event.data,
          isRemote: true,
        });
      };
    }
    break;
  default:
    break;
}

