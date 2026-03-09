// src/pages/GameDetail.tsx (CRUD COMPLETO)
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Calendar, Loader2, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gamesService } from "@/services/games";
import { reviewsService } from "@/services/reviews"; 
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const GameDetail = () => {
  const { id } = useParams();
  const gameId = Number(id);
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewNote, setReviewNote] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [currentReviewId, setCurrentReviewId] = useState<number | null>(null);

  const { data: game, isLoading: gameLoading } = useQuery({
    queryKey: ['game', id],
    queryFn: () => gamesService.getById(gameId),
    enabled: !!id,
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => reviewsService.getByGame(gameId),
    enabled: !!id,
  });

  // Encontra a avaliação do usuário logado, se existir
  const userReview = reviews.find(r => r.id_usuario === currentUser?.id_usuario);
  
  // ✅ VERIFICAÇÃO DE ADMIN CORRIGIDA
  const isAdmin = currentUser?.tipo_usuario === 'admin';

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.nota, 0) / reviews.length).toFixed(1)
    : '0.0';

  // === MUTAÇÕES CRUD ===

  // 1. CRIAÇÃO (POST /api/avaliacoes)
  const createReviewMutation = useMutation({
    mutationFn: reviewsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
      queryClient.invalidateQueries({ queryKey: ['user-reviews', currentUser?.id_usuario] });
      toast({ title: "Sucesso!", description: "Avaliação adicionada." });
      setIsReviewModalOpen(false);
      resetReviewForm();
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao adicionar avaliação.", variant: "destructive" });
    }
  });

  // 2. EDIÇÃO (PUT /api/avaliacoes/{id})
  const updateReviewMutation = useMutation({
    mutationFn: (data: { id: number, nota: number, comentario: string }) => 
      reviewsService.update(data.id, { nota: data.nota, comentario: data.comentario }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
      queryClient.invalidateQueries({ queryKey: ['user-reviews', currentUser?.id_usuario] });
      toast({ title: "Sucesso!", description: "Avaliação atualizada." });
      setIsReviewModalOpen(false);
      resetReviewForm();
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao atualizar avaliação.", variant: "destructive" });
    }
  });

  // 3. EXCLUSÃO (DELETE /api/avaliacoes/{id})
  const deleteReviewMutation = useMutation({
    mutationFn: (id: number) => reviewsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
      queryClient.invalidateQueries({ queryKey: ['user-reviews', currentUser?.id_usuario] });
      toast({ title: "Sucesso!", description: "Avaliação deletada." });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao deletar avaliação.", variant: "destructive" });
    }
  });

  // ✅ MUTAÇÃO PARA DELETAR JOGO (APENAS ADMIN)
  const deleteGameMutation = useMutation({
    mutationFn: gamesService.delete,
    onSuccess: () => {
      toast({ title: "Sucesso!", description: "Jogo deletado." });
      window.location.href = '/games';
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao deletar jogo.", variant: "destructive" });
    }
  });

  // Função chamada ao clicar em "Publicar Avaliação" ou "Salvar Edição" no modal
  const handleSubmitReview = () => {
    if (!reviewNote || reviewNote < 1) {
      toast({ title: "Erro", description: "A nota deve ser no mínimo 1.", variant: "destructive" });
      return;
    }
    
    // Lógica de Edição
    if (isEdit && currentReviewId) {
      updateReviewMutation.mutate({
        id: currentReviewId,
        nota: reviewNote,
        comentario: reviewComment,
      });
    } 
    // Lógica de Criação
    else if (currentUser) {
      createReviewMutation.mutate({
        id_jogo: gameId,
        id_usuario: currentUser.id_usuario,
        nota: reviewNote,
        comentario: reviewComment,
      });
    }
  };

  // Prepara o modal para edição ou criação
  const openReviewModal = (review?: any) => {
    if (review) {
      setIsEdit(true);
      setCurrentReviewId(review.id_avaliacao);
      setReviewNote(review.nota);
      setReviewComment(review.comentario);
    } else {
      setIsEdit(false);
      setCurrentReviewId(null);
      setReviewNote(userReview?.nota || 0);
      setReviewComment(userReview?.comentario || "");
    }
    setIsReviewModalOpen(true);
  };

  const resetReviewForm = () => {
    setReviewNote(0);
    setReviewComment("");
    setIsEdit(false);
    setCurrentReviewId(null);
  }

  // ✅ FUNÇÃO PARA DELETAR JOGO (APENAS ADMIN)
  const handleDeleteGame = () => {
    if (window.confirm("Tem certeza que deseja deletar este jogo? Esta ação é irreversível.")) {
      deleteGameMutation.mutate(gameId);
    }
  };

  const handleDeleteReview = (id: number) => {
    if (window.confirm("Tem certeza que deseja deletar sua avaliação?")) {
      deleteReviewMutation.mutate(id);
    }
  };

  if (gameLoading) {
    return (
      <div className="min-h-screen bg-background pt-24 px-6 flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-[#2dd4bf] animate-spin" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-background pt-24 px-6 text-center py-32">
        <h1 className="font-pixel text-4xl text-[#2dd4bf] mb-6">Jogo não encontrado</h1>
        <Button onClick={() => window.location.href = '/games'} className="bg-[#2dd4bf] hover:bg-[#0d9488] text-black font-bold text-lg px-8 py-6">
          Voltar para Jogos
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 bg-background">
      <main className="max-w-6xl mx-auto px-6 py-10">
        <Link to="/games">
          <Button variant="ghost" className="mb-6 text-muted-foreground hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Jogos
          </Button>
        </Link>

        {/* Game Header Section */}
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Game Cover */}
          <div className="lg:w-1/3 flex-shrink-0">
            <div className="bg-gradient-to-br from-[#123a32] to-[#0d241a] rounded-xl aspect-[3/4] flex items-center justify-center overflow-hidden shadow-2xl shadow-black/50">
              {game.tem_imagem ? (
                <img 
                  src={gamesService.getImageUrl(game.id_jogo)} 
                  alt={game.nm_jogo}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement!.innerHTML = `
                        <span class="font-pixel text-xs text-muted-foreground">POSTER</span>
                      `;
                  }}
                />
              ) : (
                <span className="font-pixel text-xs text-muted-foreground">POSTER</span>
              )}
            </div>
          </div>

          {/* Game Info */}
          <div className="flex-1 space-y-6">
            <h1 className="font-pixel text-6xl text-[#2dd4bf] drop-shadow-lg tracking-wider">
              {game.nm_jogo}
            </h1>
            
            {/* Metadados */}
            <div className="flex flex-wrap items-center gap-6 text-lg text-muted-foreground">
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-[#2dd4bf] fill-[#2dd4bf]" />
                <span className="font-bold text-white">{averageRating}</span>
                <span className="text-sm">({reviews.length} avaliações)</span>
              </div>
              
              <span className="text-xl font-bold text-gray-700">|</span>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-[#2dd4bf]" />
                <span className="font-medium text-white">
                  {game.dt_jogo ? new Date(game.dt_jogo).getFullYear() : 'N/A'}
                </span>
              </div>

              <span className="text-xl font-bold text-gray-700">|</span>

              <span className="px-3 py-1 bg-[#2dd4bf]/20 text-[#2dd4bf] font-bold rounded-full text-sm">
                  {game.genero}
              </span>
              <span className="px-3 py-1 bg-red-800/20 text-red-500 font-bold rounded-full text-sm">
                  {game.classificacao}
              </span>
            </div>
            
            {/* User Review Actions */}
            <div className="pt-4">
              {currentUser && (
                userReview ? (
                  <div className="flex gap-4">
                    <Button 
                      onClick={() => openReviewModal(userReview)}
                      size="lg" 
                      className="bg-transparent border-2 border-[#2dd4bf] text-[#2dd4bf] hover:bg-[#2dd4bf] hover:text-black font-bold text-lg px-8 transition-all"
                    >
                      <Edit2 className="w-5 h-5 mr-2" />
                      Editar Minha Avaliação
                    </Button>
                    <Button
                      onClick={() => handleDeleteReview(userReview.id_avaliacao)}
                      size="lg"
                      variant="destructive"
                      className="text-lg px-8"
                      disabled={deleteReviewMutation.isPending}
                    >
                      <Trash2 className="w-5 h-5 mr-2" />
                      Deletar
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={() => openReviewModal()}
                    size="lg" 
                    className="bg-[#2dd4bf] hover:bg-[#0d9488] text-black font-bold text-lg px-8 shadow-lg hover:shadow-[#2dd4bf]/50 transition-all"
                  >
                    <Star className="w-5 h-5 mr-2" />
                    Avaliar Jogo
                  </Button>
                )
              )}
            </div>

            {/* ✅ ADMIN ACTIONS - APENAS PARA ADMIN */}
            {isAdmin && (
                <div className="pt-4">
                    <Button
                        variant="destructive"
                        size="lg"
                        onClick={handleDeleteGame}
                        disabled={deleteGameMutation.isPending}
                        className="text-lg px-8 bg-red-600 hover:bg-red-700"
                    >
                        <Trash2 className="w-5 h-5 mr-2" />
                        {deleteGameMutation.isPending ? "Deletando..." : "Deletar Jogo (Admin)"}
                    </Button>
                    <p className="text-sm text-gray-400 mt-2">
                      Apenas administradores podem deletar jogos. Esta ação é irreversível.
                    </p>
                </div>
            )}
            
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="font-pixel text-4xl text-white mb-8 border-b-2 border-[#2dd4bf]/40 pb-4">
            Avaliações ({reviews.length})
          </h2>

          {reviewsLoading ? (
            <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-xl bg-[#0d241a]/50" />
                ))}
            </div>
          ) : (
            <div>
              {reviews.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Nenhuma avaliação ainda. Seja o primeiro a avaliar!
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id_avaliacao} className="bg-[#0d241a]/60 border border-[#2dd4bf]/30 rounded-xl p-6 shadow-lg">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <Link to={`/profile/${review.id_usuario}`} className="font-semibold text-white text-lg hover:text-[#2dd4bf] transition-colors">
                            {review.nm_usuario || 'Usuário Desconhecido'}
                          </Link>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-[#2dd4bf] fill-[#2dd4bf]" />
                              <span>{review.nota.toFixed(1)}</span>
                            </div>
                            
                            <span>•</span>
                            <span className="text-xs text-gray-500">
                                {new Date(review.dt_avaliacao).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>

                        {/* Ações de edição/deleção no comentário individual */}
                        {currentUser?.id_usuario === review.id_usuario && (
                          <div className="flex gap-2">
                              <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => openReviewModal(review)}
                                  className="h-8 w-8 text-muted-foreground hover:text-[#2dd4bf]"
                              >
                                  <Edit2 className="w-5 h-5" />
                              </Button>
                              <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleDeleteReview(review.id_avaliacao)}
                                  className="h-8 w-8 text-muted-foreground hover:text-red-500"
                              >
                                  <Trash2 className="w-5 h-5" />
                              </Button>
                          </div>
                        )}
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {review.comentario}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal de Avaliação */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="bg-[#0b1e19] border-2 border-[#2dd4bf] max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-pixel text-3xl text-[#2dd4bf]">
              {isEdit ? "Editar Avaliação" : "Avaliar: " + game.nm_jogo}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Seleção de Nota */}
            <div>
              <label className="text-lg text-[#2dd4bf] font-bold block mb-2">Sua Nota: {reviewNote.toFixed(1)} / 5.0</label>
              <div className="flex justify-between items-center bg-[#0d241a] p-3 rounded-xl border border-[#2dd4bf]/40">
                {[1, 2, 3, 4, 5].map((starValue) => (
                  <Star
                    key={starValue}
                    className={`w-8 h-8 cursor-pointer transition-colors ${
                      starValue <= reviewNote ? 'text-[#2dd4bf] fill-[#2dd4bf]' : 'text-gray-600'
                    }`}
                    onClick={() => setReviewNote(starValue)}
                  />
                ))}
              </div>
            </div>

            {/* Comentário */}
            <div className="space-y-2">
              <label htmlFor="review-comment" className="text-lg text-[#2dd4bf] font-bold">Comentário (Opcional)</label>
              <Textarea
                id="review-comment"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="O que você achou do jogo?"
                className="bg-[#0d241a] border-[#2dd4bf]/40 text-white min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter className="gap-4">
            <DialogClose asChild>
              <Button variant="outline" onClick={resetReviewForm} className="border-[#2dd4bf] text-[#2dd4bf] hover:bg-[#2dd4bf]/10 font-bold">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              onClick={handleSubmitReview}
              disabled={!reviewNote || createReviewMutation.isPending || updateReviewMutation.isPending}
              className="bg-[#2dd4bf] hover:bg-[#0d9488] text-black font-bold"
            >
              {createReviewMutation.isPending || updateReviewMutation.isPending ? "Salvando..." : (isEdit ? "Salvar Edição" : "Publicar Avaliação")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GameDetail;
