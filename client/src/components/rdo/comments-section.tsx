import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CommentItem } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { v4 as uuidv4 } from 'uuid';

interface CommentsSectionProps {
  onChange: (comments: CommentItem[]) => void;
  initialData?: CommentItem[];
}

export function CommentsSection({ onChange, initialData = [] }: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>(initialData);
  const [commentText, setCommentText] = useState("");
  const { user } = useAuth();

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    if (!user) {
      // Handle not logged in user
      return;
    }

    const newComment: CommentItem = {
      id: uuidv4(),
      text: commentText,
      createdAt: new Date().toISOString(),
      createdBy: {
        id: user.id,
        name: user.name,
        jobTitle: user.jobTitle || "Usuário"
      }
    };

    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    onChange(updatedComments);
    setCommentText("");
  };

  const formatCommentDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      return "Data desconhecida";
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium leading-6 text-slate-900 mb-4">Comentários</h3>
        
        <div className="bg-slate-50 p-4 rounded-lg">
          {comments.length > 0 && (
            <div className="space-y-4 mb-4">
              {comments.map(comment => (
                <div key={comment.id} className="flex">
                  <div className="flex-shrink-0 mr-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{comment.createdBy.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 bg-white rounded-lg px-4 py-3 sm:px-6 border border-slate-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm font-medium text-slate-900">{comment.createdBy.name}</span>
                        <span className="ml-2 text-sm text-slate-500">{comment.createdBy.jobTitle}</span>
                      </div>
                      <span className="text-sm text-slate-500">{formatCommentDate(comment.createdAt)}</span>
                    </div>
                    <div className="mt-1 text-sm text-slate-700">
                      <p>{comment.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex">
            <div className="flex-shrink-0 mr-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1">
              <Textarea
                rows={3}
                placeholder="Adicione um comentário..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="focus:ring-primary focus:border-primary"
              />
              <div className="mt-2 flex justify-end">
                <Button onClick={handleAddComment} disabled={!commentText.trim()}>
                  Comentar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
