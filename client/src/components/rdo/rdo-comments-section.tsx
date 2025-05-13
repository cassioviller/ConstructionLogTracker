import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

// Schema with local validations
const commentFormSchema = z.object({
  conteudo: z.string().min(1, "O comentário não pode estar vazio"),
});

type CommentFormValues = z.infer<typeof commentFormSchema>;

type User = {
  id: number;
  nome: string;
  cargo?: string;
  avatarUrl?: string;
};

type Comment = {
  id?: number;
  rdoId?: number;
  userId: number;
  user?: User;
  conteudo: string;
  createdAt?: Date;
};

interface RdoCommentsSectionProps {
  rdoId?: number;
  comments: Comment[];
  onAddComment: (comment: Comment) => void;
}

export function RdoCommentsSection({
  rdoId,
  comments,
  onAddComment
}: RdoCommentsSectionProps) {
  const { user } = useAuth();
  
  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      conteudo: "",
    },
  });
  
  const onSubmit = (data: CommentFormValues) => {
    if (!user) return;
    
    const newComment: Comment = {
      conteudo: data.conteudo,
      userId: user.id,
      user: {
        id: user.id,
        nome: user.nome,
        cargo: user.cargo
      },
      createdAt: new Date()
    };
    
    onAddComment(newComment);
    form.reset();
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };
  
  // Format date to show only time if today, or date and time if other day
  const formatDateTime = (date?: Date) => {
    if (!date) return "";
    
    const now = new Date();
    const isToday = date.getDate() === now.getDate() && 
                    date.getMonth() === now.getMonth() && 
                    date.getFullYear() === now.getFullYear();
    
    if (isToday) {
      return `Hoje às ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else {
      const dateOptions: Intl.DateTimeFormatOptions = { 
        day: '2-digit', 
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Intl.DateTimeFormat('pt-BR', dateOptions).format(date);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-base font-medium text-slate-800">Comentários</h3>
      </div>
      
      <div className="bg-slate-50 p-4 rounded-lg space-y-4">
        <div className="space-y-3">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="flex">
                <div className="flex-shrink-0 mr-3">
                  <Avatar>
                    <AvatarImage 
                      src={comment.user?.avatarUrl} 
                      alt={comment.user?.nome} 
                    />
                    <AvatarFallback className="bg-primary text-white">
                      {getInitials(comment.user?.nome || "Usuário")}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 bg-white p-3 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-center mb-1">
                    <div>
                      <span className="text-sm font-medium text-slate-900">{comment.user?.nome || "Usuário"}</span>
                      {comment.user?.cargo && (
                        <span className="ml-2 text-sm text-slate-500">{comment.user.cargo}</span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{formatDateTime(comment.createdAt)}</span>
                  </div>
                  <div className="mt-1 text-sm text-slate-700">
                    <p>{comment.conteudo}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-slate-500">
              <p>Seja o primeiro a comentar.</p>
            </div>
          )}
        </div>
        
        <div className="flex">
          <div className="flex-shrink-0 mr-3">
            <Avatar>
              <AvatarImage 
                src={user?.avatarUrl} 
                alt={user?.nome} 
              />
              <AvatarFallback className="bg-primary text-white">
                {getInitials(user?.nome || "US")}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="conteudo"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea 
                          placeholder="Adicione um comentário..." 
                          className="resize-none" 
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="mt-2 flex justify-end">
                  <Button type="submit">
                    Comentar
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
