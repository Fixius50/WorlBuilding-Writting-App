import React from "react";
import { WritingUseCase, WritingComment } from "@features/Writing";
import { CommentAnchorRange } from "@utils/commentAnchors";

/**
 * 📝 WritingCommentsPanel
 * Panel inferior de comentarios del documento (estilo VSCode Git).
 * Actualmente muestra un placeholder; futuro: lista de anotaciones por selección de texto.
 *
 * Extraído de WritingView.tsx para separar responsabilidades.
 */
interface WritingCommentsPanelProps {
  pageId: number | null;
  selection: {
    text: string;
    from: number;
    to: number;
  } | null;
  composeRequestKey?: number;
  onAnchorsChange?: (anchors: CommentAnchorRange[]) => void;
}

const WritingCommentsPanel: React.FC<WritingCommentsPanelProps> = ({
  pageId,
  selection,
  composeRequestKey = 0,
  onAnchorsChange,
}) => {
  const [comments, setComments] = React.useState<WritingComment[]>([]);
  const [newComment, setNewComment] = React.useState("");
  const [replyDrafts, setReplyDrafts] = React.useState<Record<number, string>>(
    {},
  );
  const [loading, setLoading] = React.useState(false);
  const commentInputRef = React.useRef<HTMLInputElement | null>(null);

  const loadComments = React.useCallback(async () => {
    if (!pageId) {
      setComments([]);
      return;
    }

    setLoading(true);
    try {
      const data = await WritingUseCase.getComments(pageId);
      setComments(data);

      const anchors: CommentAnchorRange[] = data
        .filter((comment) => comment.rango_inicio !== null && comment.rango_fin !== null)
        .map((comment) => ({
          id: comment.id,
          from: Number(comment.rango_inicio),
          to: Number(comment.rango_fin),
          resolved: comment.estado === "resolved",
        }));

      onAnchorsChange ? onAnchorsChange(anchors) : null;
    } catch {
      setComments([]);
      onAnchorsChange ? onAnchorsChange([]) : null;
    } finally {
      setLoading(false);
    }
  }, [onAnchorsChange, pageId]);

  React.useEffect(() => {
    loadComments();
  }, [loadComments]);

  React.useEffect(() => {
    const canFocus = !!pageId && composeRequestKey > 0;

    canFocus
      ? window.requestAnimationFrame(() => {
          commentInputRef.current ? commentInputRef.current.focus() : null;
        })
      : null;
  }, [composeRequestKey, pageId]);

  const rootComments = comments.filter((comment) => comment.parent_id === null);

  const getReplies = (commentId: number): WritingComment[] => {
    return comments.filter((comment) => comment.parent_id === commentId);
  };

  const addComment = async (): Promise<void> => {
    const text = newComment.trim();
    if (!pageId || !text) {
      return;
    }

    await WritingUseCase.createComment({
      pageId,
      text,
      selectedText: selection ? selection.text : null,
      rangeStart: selection ? selection.from : null,
      rangeEnd: selection ? selection.to : null,
    });

    setNewComment("");
    await loadComments();
  };

  const addReply = async (parentId: number): Promise<void> => {
    const draft = (replyDrafts[parentId] || "").trim();
    if (!pageId || !draft) {
      return;
    }

    await WritingUseCase.createComment({
      pageId,
      text: draft,
      parentId,
    });

    setReplyDrafts((prev) => ({ ...prev, [parentId]: "" }));
    await loadComments();
  };

  const toggleResolve = async (comment: WritingComment): Promise<void> => {
    const action =
      comment.estado === "resolved"
        ? WritingUseCase.reopenComment(comment.id)
        : WritingUseCase.resolveComment(comment.id);

    await action;
    await loadComments();
  };

  const removeComment = async (commentId: number): Promise<void> => {
    await WritingUseCase.deleteComment(commentId);
    await loadComments();
  };

  return (
    <div className="h-1/3 min-h-[200px] border-t-2 border-foreground/10 bg-background/50 flex flex-col shrink-0">
      <div className="p-2 border-b border-foreground/5 flex items-center gap-2 bg-background sticky top-0">
        <span className="material-symbols-outlined text-sm text-foreground/40">
          forum
        </span>
        <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-foreground/60">
          Comentarios del Documento
        </span>
      </div>
      <div className="flex-grow overflow-y-auto p-3 custom-scrollbar flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            ref={commentInputRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addComment();
              }
            }}
            className="flex-1 bg-foreground/[0.03] border border-foreground/10 px-3 py-2 rounded-md text-[11px] outline-none focus:border-primary/50"
            placeholder="Escribe un comentario..."
            disabled={!pageId}
          />
          <button
            onClick={addComment}
            disabled={!pageId || !newComment.trim()}
            className="px-3 py-2 rounded-md text-[10px] uppercase font-bold tracking-wider bg-primary/90 text-foreground disabled:opacity-40"
          >
            Añadir
          </button>
        </div>

        {selection ? (
          <div className="border border-primary/20 bg-primary/5 rounded-md p-2">
            <div className="text-[9px] uppercase tracking-wider font-bold text-primary/80">
              Anclado a selección
            </div>
            <div className="text-[10px] text-foreground/80 mt-1 line-clamp-2">
              "{selection.text}"
            </div>
            <div className="text-[9px] text-foreground/45 mt-1 font-mono">
              Rango: {selection.from} - {selection.to}
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="text-[10px] text-foreground/45">
            Cargando comentarios...
          </div>
        ) : rootComments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4 opacity-50">
            <span className="material-symbols-outlined text-2xl mb-2">
              speaker_notes_off
            </span>
            <span className="text-[10px] font-sans">
              No hay comentarios en esta hoja.
            </span>
            <span className="text-[9px] font-sans mt-1">
              Añade notas para revisión editorial.
            </span>
          </div>
        ) : (
          rootComments.map((comment) => {
            const replies = getReplies(comment.id);
            const isResolved = comment.estado === "resolved";
            return (
              <div
                key={comment.id}
                className={`border rounded-md p-2 ${isResolved ? "border-foreground/10 opacity-70" : "border-primary/20"}`}
              >
                <div className="text-[11px] text-foreground/85">
                  {comment.texto}
                </div>
                {comment.seleccion_texto ? (
                  <div className="text-[10px] text-foreground/60 mt-1 italic border-l-2 border-primary/30 pl-2">
                    "{comment.seleccion_texto}"
                  </div>
                ) : null}
                <div className="text-[9px] text-foreground/40 mt-1">
                  {new Date(comment.created_at).toLocaleString()}
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => toggleResolve(comment)}
                    className="text-[9px] uppercase font-bold tracking-wider text-primary"
                  >
                    {isResolved ? "Reabrir" : "Resolver"}
                  </button>
                  <button
                    onClick={() => removeComment(comment.id)}
                    className="text-[9px] uppercase font-bold tracking-wider text-red-400"
                  >
                    Borrar
                  </button>
                </div>

                {replies.length > 0 && (
                  <div className="mt-2 pl-3 border-l border-foreground/10 space-y-2">
                    {replies.map((reply) => (
                      <div
                        key={reply.id}
                        className="text-[10px] text-foreground/75"
                      >
                        {reply.texto}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-2 flex gap-2">
                  <input
                    value={replyDrafts[comment.id] || ""}
                    onChange={(e) =>
                      setReplyDrafts((prev) => ({
                        ...prev,
                        [comment.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addReply(comment.id);
                      }
                    }}
                    className="flex-1 bg-foreground/[0.02] border border-foreground/10 px-2 py-1 rounded text-[10px] outline-none focus:border-primary/50"
                    placeholder="Responder..."
                    disabled={isResolved}
                  />
                  <button
                    onClick={() => addReply(comment.id)}
                    disabled={
                      isResolved || !(replyDrafts[comment.id] || "").trim()
                    }
                    className="px-2 py-1 rounded text-[9px] uppercase font-bold tracking-wider bg-foreground/10 disabled:opacity-40"
                  >
                    Responder
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default WritingCommentsPanel;
