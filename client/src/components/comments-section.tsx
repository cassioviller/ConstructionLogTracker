import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { User } from "@shared/schema";
import { Send } from "lucide-react";

interface Comment {
  id?: string;
  content: string;
  userId?: number;
  userName?: string;
  userRole?: string;
  createdAt?: string;
}

interface CommentsSectionProps {
  comments: Comment[];
  onChange: (comments: Comment[]) => void;
  user: User | null;
}

const CommentsSection = ({ comments, onChange, user }: CommentsSectionProps) => {
  const [newComment, setNewComment] = useState("");

  const formatTime = (timeString?: string) => {
    if (!timeString) return "";
    return new Date(timeString).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleAddComment = () => {
    if (newComment.trim() === "") return;
    
    const comment: Comment = {
      id: crypto.randomUUID(),
      content: newComment,
      userId: user?.id,
      userName: user?.name || "Usuário",
      userRole: user?.role || "Membro da equipe",
      createdAt: new Date().toISOString(),
    };
    
    onChange([...comments, comment]);
    setNewComment("");
  };

  const getUserInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <div className="space-y-4">
      {comments.length > 0 && (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex">
              <div className="flex-shrink-0 mr-3">
                <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center text-sm">
                  {getUserInitials(comment.userName)}
                </div>
              </div>
              <div className="flex-1 bg-slate-50 rounded-lg px-4 py-3 sm:px-6">
                <div className="flex justify-between">
                  <div>
                    <span className="text-sm font-medium text-slate-900">{comment.userName}</span>
                    <span className="ml-2 text-sm text-slate-500">{comment.userRole}</span>
                  </div>
                  <span className="text-sm text-slate-500">{formatTime(comment.createdAt)}</span>
                </div>
                <div className="mt-1 text-sm text-slate-700">
                  <p>{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex">
        <div className="flex-shrink-0 mr-3">
          <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center text-sm">
            {getUserInitials(user?.name)}
          </div>
        </div>
        <div className="flex-1">
          <Textarea
            placeholder="Adicione um comentário..."
            rows={2}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="mt-2 flex justify-between items-center">
            <span className="text-xs text-slate-500">
              Pressione Ctrl+Enter para enviar
            </span>
            <Button 
              onClick={handleAddComment}
              disabled={newComment.trim() === ""}
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              Comentar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsSection;
