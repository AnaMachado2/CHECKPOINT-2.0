// src/pages/Profile.tsx (CÓDIGO CORRIGIDO E ESTABILIZADO)
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
  User, Mail, AtSign, Edit2, Star, Loader2, Check, X,
  Search, Plus, Trash2, Shield, Gamepad2, Tag, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription, DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { listsService } from "@/services/lists";
import { usersService } from "@/services/users";
import { gamesService } from "@/services/games";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Import necessário para o CRUD de Reviews
import { reviewsService } from "@/services/reviews"; 

// ============ TIPOS ============
interface Game {
  id_jogo: number;
  nm_jogo: string;
  genero?: string;
  dt_jogo?: string;
  tem_imagem?: boolean;
  classificacao?: string;
}

interface Review {
  id_avaliacao: number;
  id_jogo: number;
  nm_jogo: string;
  nota: number;
  comentario?: string;
  dt_avaliacao?: string;
}

interface UserList {
  id_lista: number;
  nm_lista: string;
  descricao?: string;
  categoria?: string;
  jogos?: Game[];
  nm_usuario?: string;
  total_jogos?: number;
}

interface ProfileUser {
  id_usuario: number;
  nm_usuario: string;
  email_usuario: string;
  tipo_usuario: 'user' | 'admin';
  dt_cadastro?: string;
}

// ============ CONSTANTES ============
const CATEGORIES = [
  { id: "top-jogos", label: "Top Jogos", icon: "Trophy" },
  { id: "tematica", label: "Temática", icon: "Masks" },
  { id: "genero", label: "Gênero", icon: "Gamepad2" },
  { id: "ano", label: "Por Ano", icon: "Calendar" },
  { id: "plataforma", label: "Plataforma", icon: "Target" },
  { id: "recomendacao", label: "Recomendação", icon: "Star" },
];

const TABS = [
  { id: "overview", label: "Visão Geral" },
  { id: "reviews", label: "Minhas Avaliações" },
  { id: "lists", label: "Minhas Listas" },
];

// ============ COMPONENTE PRINCIPAL ============
const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Estados
  const [activeTab, setActiveTab] = useState("overview");
  // Edit Profile Modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  // Create List Modal
  const [isCreateListOpen, setIsCreateListOpen] = useState(false);
  // Edit Review Modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState<Review | null>(null);
  const [reviewNote, setReviewNote] = useState(0);
  const [reviewComment, setReviewComment] = useState("");


  // Estados de Formulário
  const [editForm, setEditForm] = useState({
    nm_usuario: "",
    email_usuario: "",
    senha: "",
  });
  const [listTitle, setListTitle] = useState("");
  const [listDescription, setListDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [gameSearchQuery, setGameSearchQuery] = useState("");
  const [selectedGames, setSelectedGames] = useState<Game[]>([]);

  // Lógica de permissões
  const profileId = id || currentUser?.id_usuario?.toString();
  const isOwnProfile = currentUser?.id_usuario?.toString() === profileId;
  const isAdmin = currentUser?.tipo_usuario === 'admin';
  const canDeleteViewedUser = isAdmin && !isOwnProfile;

  // ============ QUERIES ============
  const {
    data: profileUser,
    isLoading: loadingUser,
    isError: hasUserError,
  } = useQuery<ProfileUser>({
    queryKey: ["user", profileId],
    queryFn: () => usersService.getById(profileId!),
    enabled: !!profileId,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: reviews = [],
    isLoading: loadingReviews,
    isFetching: fetchingReviews
  } = useQuery<Review[]>({
    queryKey: ["user-reviews", profileId],
    queryFn: () => usersService.getReviews(Number(profileId)),
    enabled: !!profileId && activeTab === "reviews",
  });

  const {
    data: userLists = [],
    isLoading: loadingLists
  } = useQuery<UserList[]>({
    queryKey: ["user-lists", profileId],
    queryFn: () => listsService.getByUser(Number(profileId)),
    enabled: !!profileId && activeTab === "lists",
  });

  const {
    data: availableGames = [],
    isLoading: loadingAvailableGames 
  } = useQuery<Game[]>({
    queryKey: ["games"],
    queryFn: gamesService.getAll,
    enabled: isCreateListOpen,
  });

  // Jogos filtrados para busca no modal de criação de lista
  const filteredGames = availableGames.filter((game: Game) =>
    game.nm_jogo.toLowerCase().includes(gameSearchQuery.toLowerCase())
  );

  // ============ MUTATIONS ============
  // Mutações de Perfil (Manter)
  const updateMutation = useMutation({
    mutationFn: (data: { nm_usuario: string; email_usuario: string; senha?: string }) =>
      usersService.update(currentUser!.id_usuario, data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ["user", profileId] });
      const previous = queryClient.getQueryData(["user", profileId]);
      queryClient.setQueryData(["user", profileId], (old: any) => ({ ...old, ...newData }));
      return { previous };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["user", profileId], context?.previous);
      toast({ title: "Erro", description: "Erro ao salvar as alterações.", variant: "destructive" });
    },
    onSuccess: () => {
      toast({ title: "Sucesso!", description: "Perfil atualizado com sucesso!" });
      setIsEditOpen(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user", profileId] });
    },
  });

  // Mutações de Lista (Manter)
  const createListMutation = useMutation({
    mutationFn: (data: any) => listsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-lists", profileId] });
      toast({ title: "Sucesso!", description: "Lista criada com sucesso!" });
      setIsCreateListOpen(false);
      resetListForm();
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao criar lista.", variant: "destructive" });
    },
  });

  // Mutações de Admin (Manter)
  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => {
        if (usersService.delete) {
             return usersService.delete(id);
        }
        return Promise.reject("usersService.delete não implementado"); 
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: `Usuário ${profileUser?.nm_usuario || ''} desativado/deletado.`,
        variant: "destructive"
      });
      navigate('/games');
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao desativar usuário. (Verifique a implementação do usersService.delete)",
        variant: "destructive"
      });
    }
  });

  // Mutações de Review (NOVO: Edição e Deleção de review própria)
  const updateReviewMutation = useMutation({
    mutationFn: (data: { id_avaliacao: number, nota: number, comentario: string }) => 
      reviewsService.update(data.id_avaliacao, { nota: data.nota, comentario: data.comentario }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-reviews", profileId] });
      toast({ title: "Sucesso!", description: "Avaliação atualizada." });
      setIsReviewModalOpen(false);
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao atualizar avaliação.", variant: "destructive" });
    }
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (id: number) => reviewsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-reviews", profileId] });
      toast({ title: "Sucesso!", description: "Avaliação deletada." });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao deletar avaliação.", variant: "destructive" });
    }
  });

  // ============ HANDLERS DE AVALIAÇÃO ============
  
  const resetReviewForm = () => {
      setCurrentReview(null);
      setReviewNote(0);
      setReviewComment("");
  };

  const openEditReviewModal = (review: Review) => {
    setCurrentReview(review);
    setReviewNote(review.nota);
    setReviewComment(review.comentario || "");
    setIsReviewModalOpen(true);
  };
  
  const handleEditReview = () => {
      if (!currentReview || reviewNote < 1) {
          toast({ title: "Erro", description: "A nota deve ser no mínimo 1.", variant: "destructive" });
          return;
      }

      updateReviewMutation.mutate({
          id_avaliacao: currentReview.id_avaliacao,
          nota: reviewNote,
          comentario: reviewComment,
      });
  };

  const handleDeleteReview = (id: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (window.confirm("Tem certeza que deseja deletar esta avaliação?")) {
          deleteReviewMutation.mutate(id);
      }
  };


  // ============ HANDLERS GERAIS ============

  const handleDeleteUser = () => {
    if (!profileUser) return; 

    if (window.confirm(
      `Tem certeza que deseja DESATIVAR/DELETAR permanentemente o usuário ${profileUser.nm_usuario}? Esta ação é irreversível.`
    )) {
      deleteUserMutation.mutate(Number(profileId));
    }
  };

  const resetListForm = () => {
    setListTitle("");
    setListDescription("");
    setSelectedCategory("");
    setSelectedGames([]);
    setGameSearchQuery("");
  };

  const openEditModal = () => {
    if (!profileUser) return;
    setEditForm({
      nm_usuario: profileUser.nm_usuario,
      email_usuario: profileUser.email_usuario,
      senha: "",
    });
    setIsEditOpen(true);
  };

  // Funções de Edição de Perfil (Manter)
  const handleSaveProfile = () => {
    if (!editForm.nm_usuario.trim() || !editForm.email_usuario.trim()) {
      toast({
        title: "Erro",
        description: "Nome e email são obrigatórios",
        variant: "destructive"
      });
      return;
    }
    if (!currentUser) {
        toast({
            title: "Erro",
            description: "Usuário não autenticado.",
            variant: "destructive"
        });
        return;
    } 

    const updateData: any = {
      nm_usuario: editForm.nm_usuario,
      email_usuario: editForm.email_usuario,
    };

    if (editForm.senha && editForm.senha.trim()) {
      updateData.senha = editForm.senha;
    }

    updateMutation.mutate(updateData);
  };

  const handleCreateList = () => {
    if (selectedGames.length < 3) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos 3 jogos",
        variant: "destructive"
      });
      return;
    }
    if (!listTitle.trim()) {
      toast({
        title: "Erro",
        description: "Digite um nome para a lista",
        variant: "destructive"
      });
      return;
    }
    
    const finalDescription = listDescription.trim() || null;
    const finalCategory = selectedCategory || null;

    createListMutation.mutate({
      nm_lista: listTitle,
      descricao: finalDescription,
      categoria: finalCategory,
      lista_jogos: selectedGames.map(g => g.id_jogo),
    });
  };

  const toggleGameSelection = (game: Game) => {
    setSelectedGames(prev => {
      const exists = prev.find(g => g.id_jogo === game.id_jogo);
      if (exists) {
        return prev.filter(g => g.id_jogo !== game.id_jogo);
      }
      const gameWithImageInfo: Game = { 
        ...game, 
        tem_imagem: availableGames.find(g => g.id_jogo === game.id_jogo)?.tem_imagem || false
      };
      return [...prev, gameWithImageInfo];
    });
  };

  const isGameSelected = (gameId: number) => {
    return selectedGames.some(g => g.id_jogo === gameId);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return !isNaN(date.getTime())
      ? date.toLocaleDateString('pt-BR')
      : 'N/A';
  };

  // ============ LOADING & ERROR STATES ============
  if (loadingUser) {
    return (
      <div className="min-h-screen bg-background pt-24 px-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#2dd4bf] animate-spin mx-auto mb-6" />
          <p className="text-xl text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (hasUserError || !profileUser) {
    return (
      <div className="min-h-screen bg-background pt-24 px-6 text-center py-32">
        <h1 className="font-pixel text-4xl text-[#2dd4bf] mb-6">
          Usuário não encontrado
        </h1>
        <Button
          onClick={() => navigate("/games")}
          className="bg-[#2dd4bf] hover:bg-[#0d9488] text-black font-bold text-lg px-8 py-6"
        >
          Voltar para Jogos
        </Button>
      </div>
    );
  }

  // ============ RENDER PRINCIPAL ============
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-6">

        {/* FERRAMENTAS DE ADMINISTRADOR */}
        {isAdmin && (
          <div className="bg-[#0d241a]/60 border border-red-500/50 rounded-xl p-4 mb-10 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <Shield className="w-6 h-6 text-red-500" />
              <span className="font-bold text-red-400">
                Ferramentas de Administrador
              </span>
            </div>

            <div className="flex flex-wrap gap-4">
              {canDeleteViewedUser && (
                <Button
                  onClick={handleDeleteUser}
                  variant="destructive"
                  size="sm"
                  disabled={deleteUserMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleteUserMutation.isPending ? 'Deletando...' : 'Desativar Usuário'}
                </Button>
              )}

              <Link to="/admin/games">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#2dd4bf] text-[#2dd4bf] hover:bg-[#2dd4bf]/20"
                >
                  Gerenciar Jogos (CRUD)
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* HEADER DO PERFIL */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 mb-14">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-[#0d241a] border-4 border-[#2dd4bf] flex items-center justify-center shadow-2xl shadow-[#2dd4bf]/30">
              <User className="w-16 h-16 text-[#2dd4bf]" />
            </div>
            {profileUser.tipo_usuario === "admin" && (
              <div className="absolute -bottom-2 -right-2 bg-[#2dd4bf] text-black text-xs font-bold px-3 py-1 rounded-full shadow-xl">
                ADMIN
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="font-pixel text-5xl text-white mb-3 tracking-wider drop-shadow-lg">
              {profileUser.nm_usuario}
            </h1>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <AtSign className="w-6 h-6 text-[#2dd4bf]" />
                <span className="text-2xl font-medium text-[#2dd4bf]">
                  @{profileUser.nm_usuario.toLowerCase().replace(/\s+/g, "")}
                </span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-6 h-6" />
                <span className="text-lg">{profileUser.email_usuario}</span>
              </div>
            </div>
          </div>

          {isOwnProfile && (
            <Button
              onClick={openEditModal}
              size="lg"
              className="bg-transparent border-2 border-[#2dd4bf] text-[#2dd4bf] hover:bg-[#2dd4bf] hover:text-black font-bold text-lg px-8 transition-all duration-300 shadow-lg hover:shadow-[#2dd4bf]/50"
            >
              <Edit2 className="w-6 h-6 mr-3" />
              Editar Perfil
            </Button>
          )}
        </div>

        {/* TABS */}
        <div className="border-b-2 border-[#2dd4bf]/40 mb-12">
          <div className="flex gap-10 overflow-x-auto pb-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-2 font-pixel text-xl transition-all relative ${
                  activeTab === tab.id
                    ? "text-[#2dd4bf]"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#2dd4bf] rounded-full shadow-glow" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* CONTEÚDO DAS TABS */}
        <div className="min-h-[500px]">
          {/* VISÃO GERAL */}
          {activeTab === "overview" && (
            <div className="max-w-2xl space-y-6">
              <h2 className="font-pixel text-3xl text-[#2dd4bf] mb-8">
                Informações do Perfil
              </h2>
              <div className="space-y-5">
                <div className="bg-[#0d241a]/60 border border-[#2dd4bf]/30 rounded-2xl p-6">
                  <Label className="text-sm text-[#2dd4bf] font-bold">Nome</Label>
                  <p className="text-2xl text-white mt-2">{profileUser.nm_usuario}</p>
                </div>
                <div className="bg-[#0d241a]/60 border border-[#2dd4bf]/30 rounded-2xl p-6">
                  <Label className="text-sm text-[#2dd4bf] font-bold">Email</Label>
                  <p className="text-xl text-white mt-2">{profileUser.email_usuario}</p>
                </div>
                {profileUser.dt_cadastro && (
                  <div className="bg-[#0d241a]/60 border border-[#2dd4bf]/30 rounded-2xl p-6">
                    <Label className="text-sm text-[#2dd4bf] font-bold">
                      Membro desde
                    </Label>
                    <p className="text-xl text-white mt-2">
                      {new Date(profileUser.dt_cadastro).toLocaleDateString("pt-BR", {
                        month: "long",
                        year: "numeric"
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* MINHAS AVALIAÇÕES */}
          {activeTab === "reviews" && (
            <div>
              <h2 className="font-pixel text-3xl text-[#2dd4bf] mb-8">
                Minhas Avaliações ({reviews.length})
              </h2>
              {loadingReviews || fetchingReviews ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full bg-[#0d241a]/50" />
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-xl">Nenhuma avaliação encontrada.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div
                      key={review.id_avaliacao}
                      className="block"
                    >
                      <Card className="bg-[#0d241a]/60 border border-[#2dd4bf]/30 hover:border-[#2dd4bf]/70 transition-all duration-300 p-6 rounded-2xl">
                        
                        <div className="flex justify-between items-start">
                           {/* Nome do Jogo como Link */}
                            <Link to={`/game/${review.id_jogo}`} className="flex-1 mr-4">
                                <h3 className="font-pixel text-xl text-white hover:text-[#2dd4bf] transition-colors line-clamp-1">
                                    {review.nm_jogo}
                                </h3>
                            </Link>

                            {/* Ações e Nota */}
                            <div className="flex items-center gap-3">
                                {/* Nota */}
                                <div className="flex items-center text-[#2dd4bf] text-lg font-bold">
                                    {review.nota.toFixed(1)}
                                    <Star className="w-5 h-5 ml-1 fill-[#2dd4bf]" />
                                </div>
                                
                                {/* Ações (Apenas para o próprio perfil) */}
                                {isOwnProfile && (
                                    <div className="flex gap-1 ml-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEditReviewModal(review)}
                                            className="h-8 w-8 text-muted-foreground hover:text-[#2dd4bf]"
                                            disabled={updateReviewMutation.isPending}
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => handleDeleteReview(review.id_avaliacao, e)}
                                            className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                            disabled={deleteReviewMutation.isPending}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Comentário */}
                        <p className="text-muted-foreground mt-3 italic line-clamp-3">
                            "{review.comentario || 'Sem comentário'}"
                        </p>
                        
                        {/* Data */}
                        <p className="text-xs text-gray-500 mt-3 text-right">
                          Avaliado em: {formatDate(review.dt_avaliacao)}
                        </p>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MINHAS LISTAS */}
          {activeTab === "lists" && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-pixel text-3xl text-[#2dd4bf]">
                  Minhas Listas ({userLists.length})
                </h2>
                {isOwnProfile && (
                  <Button
                    onClick={() => setIsCreateListOpen(true)}
                    className="bg-[#2dd4bf] hover:bg-[#0d9488] text-black font-bold text-lg px-6 py-6 shadow-lg hover:shadow-[#2dd4bf]/50 transition-all"
                  >
                    <Plus className="w-6 h-6 mr-2" />
                    Criar Lista
                  </Button>
                )}
              </div>

              {loadingLists ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-72 rounded-2xl bg-[#0d241a]/50" />
                  ))}
                </div>
              ) : userLists.length === 0 ? (
                <div className="text-center py-24">
                  <div className="w-20 h-20 mx-auto mb-6 text-[#2dd4bf]/30">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <p className="text-2xl text-muted-foreground mb-8">
                    Nenhuma lista criada ainda
                  </p>
                  {isOwnProfile && (
                    <Button
                      onClick={() => setIsCreateListOpen(true)}
                      className="bg-[#2dd4bf] hover:bg-[#0d9488] text-black font-bold text-lg px-8 py-6"
                    >
                      Criar Minha Primeira Lista
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userLists.map((list) => {
                    const firstGame = Array.isArray(list.jogos) && list.jogos.length > 0 ? list.jogos[0] : null; 
                    const coverImageId = firstGame?.id_jogo;
                    const hasImage = firstGame?.tem_imagem;

                    return (
                      <Link key={list.id_lista} to={`/list/${list.id_lista}`}>
                        <Card className="bg-[#0d241a]/60 border border-[#2dd4bf]/30 hover:border-[#2dd4bf]/70 transition-all duration-300 cursor-pointer h-full rounded-2xl overflow-hidden group">
                          <div className="aspect-video bg-gradient-to-br from-[#2dd4bf]/20 to-[#0d9488]/20 flex items-center justify-center relative overflow-hidden">
                            {coverImageId && hasImage ? (
                              <img
                                src={gamesService.getImageUrl(coverImageId)}
                                alt={`Capa da lista ${list.nm_lista}`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <span className="font-pixel text-6xl text-[#2dd4bf] opacity-60 group-hover:opacity-100 transition-opacity">
                                {list.nm_lista[0]?.toUpperCase() || '?'}
                              </span>
                            )}
                          </div>
                          <div className="p-6">
                            <h3 className="font-pixel text-xl text-white group-hover:text-[#2dd4bf] transition-colors">
                              {list.nm_lista}
                            </h3>
                            <p className="text-muted-foreground mt-2 line-clamp-2">
                              {list.descricao || "Sem descrição"}
                            </p>
                          </div>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE EDIÇÃO DE PERFIL (Manter) */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-[#0a1810] border-[#2dd4bf]/50 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="font-pixel text-2xl text-[#2dd4bf]">
              Editar Perfil
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Atualize suas informações pessoais
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div>
              <Label htmlFor="edit-name" className="text-[#2dd4bf] font-bold">
                Nome
              </Label>
              <Input
                id="edit-name"
                value={editForm.nm_usuario}
                onChange={(e) => setEditForm(prev => ({
                  ...prev,
                  nm_usuario: e.target.value
                }))}
                className="bg-[#0d241a] border-[#2dd4bf]/30 text-white mt-2"
              />
            </div>

            <div>
              <Label htmlFor="edit-email" className="text-[#2dd4bf] font-bold">
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email_usuario}
                onChange={(e) => setEditForm(prev => ({
                  ...prev,
                  email_usuario: e.target.value
                }))}
                className="bg-[#0d241a] border-[#2dd4bf]/30 text-white mt-2"
              />
            </div>

            <div>
              <Label htmlFor="edit-password" className="text-[#2dd4bf] font-bold">
                Nova Senha (deixe vazio para não alterar)
              </Label>
              <Input
                id="edit-password"
                type="password"
                value={editForm.senha}
                onChange={(e) => setEditForm(prev => ({
                  ...prev,
                  senha: e.target.value
                }))}
                className="bg-[#0d241a] border-[#2dd4bf]/30 text-white mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              disabled={updateMutation.isPending}
              className="border-gray-500 text-gray-300 hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={updateMutation.isPending}
              className="bg-[#2dd4bf] hover:bg-[#0d9488] text-black font-bold"
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Check className="w-5 h-5 mr-2" />
              )}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL DE CRIAR LISTA (Manter) */}
      <Dialog open={isCreateListOpen} onOpenChange={setIsCreateListOpen}>
        <DialogContent className="bg-[#0a1810] border-[#2dd4bf]/50 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-pixel text-2xl text-[#2dd4bf]">
              Criar Nova Lista de Jogos
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Personalize sua nova lista e adicione pelo menos 3 jogos.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
            {/* Formulário da Lista */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="list-title" className="text-[#2dd4bf] font-bold">
                  Nome da Lista *
                </Label>
                <Input
                  id="list-title"
                  value={listTitle}
                  onChange={(e) => setListTitle(e.target.value)}
                  className="bg-[#0d241a] border-[#2dd4bf]/30 text-white mt-2"
                  placeholder="Ex: Meus jogos favoritos de RPG"
                />
              </div>

              <div>
                <Label htmlFor="list-description" className="text-[#2dd4bf] font-bold">
                  Descrição (Opcional)
                </Label>
                <Textarea
                  id="list-description"
                  value={listDescription}
                  onChange={(e) => setListDescription(e.target.value)}
                  className="bg-[#0d241a] border-[#2dd4bf]/30 text-white mt-2 min-h-[100px]"
                  placeholder="Fale um pouco sobre a lista..."
                />
              </div>

              <div>
                <Label className="text-[#2dd4bf] font-bold block mb-2">
                  Categoria (Opcional)
                </Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-[#0d241a] border-[#2dd4bf]/30 text-white">
                        <SelectValue placeholder="Selecione uma categoria..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a1810] border-[#2dd4bf]/50 text-white">
                        <SelectItem value="">(Nenhuma)</SelectItem>
                        {CATEGORIES.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id} className="focus:bg-[#2dd4bf]/20 focus:text-[#2dd4bf]">
                                {cat.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[#2dd4bf] font-bold block mb-2">
                  Jogos Selecionados ({selectedGames.length})
                  {selectedGames.length > 0 && (
                    <span className="text-gray-400 text-sm ml-2">
                      (Mínimo de 3 jogos)
                    </span>
                  )}
                </Label>
                <ScrollArea className="h-40 w-full rounded-md border border-[#2dd4bf]/30 p-4 bg-[#0d241a]">
                  {selectedGames.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Nenhum jogo selecionado.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedGames.map(game => (
                        <div key={game.id_jogo} className="flex items-center justify-between p-2 rounded-md bg-[#0a1810] border border-[#2dd4bf]/10">
                          <span className="text-white text-sm truncate">{game.nm_jogo}</span>
                          <X
                            className="w-4 h-4 text-red-500 cursor-pointer hover:text-red-400"
                            onClick={() => toggleGameSelection(game)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>

            {/* Seleção de Jogos */}
            <div className="space-y-4">
              <Label className="text-[#2dd4bf] font-bold">
                Buscar e Adicionar Jogos
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2dd4bf]/60" />
                <Input
                  placeholder="Buscar jogo..."
                  value={gameSearchQuery}
                  onChange={(e) => setGameSearchQuery(e.target.value)}
                  className="pl-10 bg-[#0d241a] border-[#2dd4bf]/30 text-white"
                />
              </div>

              <ScrollArea className="h-[400px] rounded-md border border-[#2dd4bf]/30 p-4 bg-[#0d241a]">
                <div className="space-y-3">
                  {/* Carregamento dos jogos no modal */}
                  {loadingAvailableGames ? (
                    <div className="text-center pt-8">
                        <Loader2 className="w-6 h-6 text-[#2dd4bf] animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground text-sm">Carregando todos os jogos...</p>
                    </div>
                  ) : filteredGames.length === 0 ? (
                    <p className="text-muted-foreground text-center pt-8">
                      Nenhum jogo encontrado.
                    </p>
                  ) : (
                    filteredGames.map((game) => (
                      <div
                        key={game.id_jogo}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${isGameSelected(game.id_jogo)
                          ? "bg-[#2dd4bf]/20 border-[#2dd4bf] shadow-md"
                          : "bg-[#0a1810] border-[#2dd4bf]/10 hover:bg-[#2dd4bf]/5"
                          }`}
                        onClick={() => toggleGameSelection(game)}
                      >
                        <span className="text-white font-medium truncate">
                          {game.nm_jogo}
                        </span>
                        {isGameSelected(game.id_jogo) ? (
                          <Check className="w-5 h-5 text-[#2dd4bf] fill-[#2dd4bf]" />
                        ) : (
                          <Plus className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateListOpen(false);
                resetListForm();
              }}
              disabled={createListMutation.isPending}
              className="border-gray-500 text-gray-300 hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateList}
              disabled={createListMutation.isPending || selectedGames.length < 3 || !listTitle.trim()}
              className="bg-[#2dd4bf] hover:bg-[#0d9488] text-black font-bold"
            >
              {createListMutation.isPending ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Plus className="w-5 h-5 mr-2" />
              )}
              Criar Lista
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* NOVO: MODAL DE EDIÇÃO DE AVALIAÇÃO */}
      <Dialog open={isReviewModalOpen} onOpenChange={(open) => {
          setIsReviewModalOpen(open);
          if (!open) resetReviewForm(); // Reseta ao fechar
      }}>
        <DialogContent className="bg-[#0b1e19] border-2 border-[#2dd4bf] max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-pixel text-3xl text-[#2dd4bf]">
              Editar Avaliação
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
             <p className="text-white text-lg font-medium">
                Jogo: <span className="text-[#2dd4bf]">{currentReview?.nm_jogo}</span>
            </p>
            {/* Seleção de Nota */}
            <div>
              <Label className="text-lg text-[#2dd4bf] font-bold block mb-2">Sua Nota: {reviewNote.toFixed(1)} / 5.0</Label>
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
              <Label htmlFor="edit-review-comment" className="text-lg text-[#2dd4bf] font-bold">Comentário (Opcional)</Label>
              <Textarea
                id="edit-review-comment"
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
              onClick={handleEditReview}
              disabled={!reviewNote || updateReviewMutation.isPending}
              className="bg-[#2dd4bf] hover:bg-[#0d9488] text-black font-bold"
            >
              {updateReviewMutation.isPending ? "Salvando..." : "Salvar Edição"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
