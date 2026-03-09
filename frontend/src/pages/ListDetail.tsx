// src/pages/ListDetail.tsx (CÓDIGO COMPLETO CORRIGIDO)
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, X, Loader2 } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; 
import { listsService } from "@/services/lists";
import { gamesService } from "@/services/games";
import { useAuth } from "@/hooks/useAuth"; // Importado useAuth
import { useToast } from "@/hooks/use-toast"; // Importado useToast

const ListDetail = () => {
  const { id } = useParams();
  const listId = Number(id);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user: currentUser } = useAuth(); // Usando useAuth

  const { data: list, isLoading } = useQuery({
    queryKey: ['list', id],
    queryFn: () => listsService.getById(listId),
    enabled: !!id,
  });

  // Cálculo robusto de permissão de edição
  const canEdit = list && Number(currentUser?.id_usuario) === Number(list.id_usuario);

  // MUTAÇÃO: Deletar Jogo de uma Lista Existente
  const removeGameMutation = useMutation({
    mutationFn: (gameId: number) => listsService.removeGame(listId, gameId), 
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["list", id] });
      toast({ title: "Sucesso!", description: "Jogo removido da lista." });
    },
    onError: (error: any) => {
      console.error(error);
      toast({ title: "Erro", description: "Falha ao remover jogo da lista.", variant: "destructive" });
    },
  });

  // Função para lidar com a remoção de um jogo
  const handleRemoveGame = (e: React.MouseEvent, gameId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Deseja realmente remover este jogo da lista?")) {
      removeGameMutation.mutate(gameId);
    }
  };
  
  // Renderização
  return (
    <div className="min-h-screen pt-16 bg-background text-white">
      <main className="max-w-5xl mx-auto px-6 py-10">
        <Link to="/lists">
          <Button variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Listas
          </Button>
        </Link>

        {isLoading ? (
         <div className="text-center py-12 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#2dd4bf]" />
            <p className="mt-4">Carregando lista...</p>
          </div>
        ) : !list ? (
          <div className="text-center py-12 text-muted-foreground">
            Lista não encontrada
          </div>
        ) : (
          <>
            <div className="text-center mb-12 pb-8 border-b border-[#2dd4bf]/40">
              <span className="inline-block font-pixel text-xs text-[#2dd4bf] mb-3">LISTA #{id}</span>
              <h1 className="font-pixel text-2xl md:text-3xl text-white mb-4 leading-relaxed">
                {list.nm_lista}
              </h1>
              <p className="text-lg text-muted-foreground mb-6">Por {list.nm_usuario}</p>
              
              <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#2dd4bf]">{list.jogos?.length || 0} jogos</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {list.jogos && list.jogos.length > 0 ? (
                list.jogos.map((game, index) => (
                  <div key={game.id_jogo} className="bg-[#0d241a]/60 border border-[#2dd4bf]/30 rounded-xl p-6 hover:bg-[#0d241a]/80 transition-all group flex items-center gap-6 relative">
                    
                    {/* Botão de Excluir (visível apenas para o dono) */}
                    {canEdit && (
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={(e) => handleRemoveGame(e, game.id_jogo)}
                            disabled={removeGameMutation.isPending}
                            className="absolute top-2 right-2 z-10 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}

                    <Link to={`/game/${game.id_jogo}`} className="flex items-center gap-6 flex-1">
                      <div className="font-pixel text-2xl text-[#2dd4bf]/50 w-12 text-center flex-shrink-0">
                        {index + 1}
                      </div>
                      
                      <div className="w-24 h-32 bg-gradient-to-br from-[#123a32] to-[#0d241a] rounded-lg flex items-center justify-center 
                       flex-shrink-0 overflow-hidden">
                        {game.tem_imagem ? (
                          <img 
                            src={gamesService.getImageUrl(game.id_jogo)} 
                            alt={game.nm_jogo}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-pixel text-[8px] text-muted-foreground">POSTER</span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-pixel text-lg text-white mb-2 group-hover:text-[#2dd4bf] transition-colors">
                          {game.nm_jogo}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>{game.dt_jogo ? new Date(game.dt_jogo).getFullYear() : 'N/A'}</span>
                          <span>{game.genero}</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Esta lista ainda não tem jogos
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ListDetail;
