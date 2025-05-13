import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { CommentItem } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

type CommentsSectionProps = {
  comments: CommentItem[];
  onCommentsChange: (comments: CommentItem[]) => void;
  disabled?: boolean;
};

export function CommentsSection({ 
  comments, 
  onCommentsChange,
  disabled = false
}: CommentsSectionProps) {
  const [newComment, setNewComment] = useState("");
  const { user } = useAuth();

  const handleAddComment = () => {
    if (!newComment.trim() || !user) return;
    
    const comment: CommentItem = {
      id: uuidv4(),
      text: newComment.trim(),
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      },
      createdAt: new Date().toISOString()
    };
    
    onCommentsChange([...comments, comment]);
    setNewComment("");
  };

  // Helper to display user's initials
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Define different background colors for different users
  const getUserColor = (userId: number) => {
    const colors = [
      "bg-primary",
      "bg-green-500",
      "bg-amber-500",
      "bg-purple-500",
      "bg-red-500",
      "bg-blue-500"
    ];
    
    return colors[userId % colors.length];
  };

  // Format date as relative time
  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const secondsPast = (now.getTime() - date.getTime()) / 1000;
    
    if (secondsPast < 60) {
      return "agora mesmo";
    }
    if (secondsPast < 3600) {
      return `${Math.floor(secondsPast / 60)} min atrás`;
    }
    if (secondsPast < 86400) {
      return `${Math.floor(secondsPast / 3600)} horas atrás`;
    }
    
    return formatDate(date);
  };

  return (
    <div>
      <h3 className="text-lg font-medium leading-6 text-slate-900 mb-3">Comentários</h3>

      <div className="bg-slate-50 p-4 rounded-lg space-y-4">
        {comments.length > 0 ? (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start">
                <div className={`flex-shrink-0 h-8 w-8 rounded-full ${getUserColor(comment.user.id)} flex items-center justify-center text-white text-sm mr-3`}>
                  {getUserInitials(comment.user.name)}
                </div>
                <div className="flex-1 bg-white p-3 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-center mb-1">
                    <div>
                      <span className="font-medium text-slate-800">{comment.user.name}</span>
                      {comment.user.role && (
                        <span className="ml-2 text-sm text-slate-500">{comment.user.role}</span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{getRelativeTime(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-600 whitespace-pre-line">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-4 rounded-lg text-center border border-slate-200">
            <p className="text-slate-500">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
          </div>
        )}
        
        {!disabled && user && (
          <div className="flex items-start">
            <div className={`flex-shrink-0 h-8 w-8 rounded-full ${getUserColor(user.id)} flex items-center justify-center text-white text-sm mr-3`}>
              {getUserInitials(user.name)}
            </div>
            <div className="flex-1">
              <Textarea
                placeholder="Adicione um comentário..."
                rows={2}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full resize-none"
              />
              <div className="mt-2 flex justify-end">
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
