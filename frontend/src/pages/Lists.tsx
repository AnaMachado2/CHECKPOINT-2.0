import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Trash2, X, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listsService } from "@/services/lists";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { gamesService } from "@/services/games";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth"; 

const Lists = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [selectedGames, setSelectedGames] = useState<number[]>([]);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user: currentUser } = useAuth(); 
  
  const isAuthenticated = !!currentUser?.id_usuario; 

  // Buscar listas
  const { data: lists = [], isLoading } = useQuery({
    queryKey: ["lists"],
    queryFn: listsService.getAll,
  });

  // Buscar todos os jogos para o modal de criação
  const { data: allGames = [], isLoading: gamesLoading } = useQuery({
    queryKey: ["allGames"],
    queryFn: gamesService.getAll,
    enabled: isCreateDialogOpen,
  });
  
  // Mutações
  const createListMutation = useMutation({
    mutationFn: (data: { nm_lista: string; lista_jogos: number[] }) => listsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      toast({ title: "Sucesso!", description: "Lista criada com sucesso." });
      setIsCreateDialogOpen(false);
      setNewListName("");
      setSelectedGames([]);
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao criar lista.", variant: "destructive" });
    }
  });

  const deleteListMutation = useMutation({
    mutationFn: (id: number) => listsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      toast({ title: "Sucesso!", description: "Lista deletada." });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao deletar lista.", variant: "destructive" });
    }
  });
  
  const handleCreateList = () => {
    if (!newListName.trim()) {
      toast({ title: "Erro", description: "O nome da lista é obrigatório.", variant: "destructive" });
      return;
    }
    if (selectedGames.length < 3) {
      toast({ title: "Erro", description: "Adicione pelo menos 3 jogos.", variant: "destructive" });
      return;
    }

    createListMutation.mutate({
      nm_lista: newListName,
      lista_jogos: selectedGames,
    });
  };

  const handleDeleteList = (id: number, e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (window.confirm("Tem certeza que deseja deletar esta lista?")) { 
        deleteListMutation.mutate(id);
    }
  };
  
  const toggleGameSelection = (id: number) => {
    setSelectedGames(prev => 
      prev.includes(id) ? prev.filter(gameId => gameId !== id) : [...prev, id]
    );
  };

  const filteredGames = allGames.filter((game: any) =>
    game.nm_jogo.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredLists = lists.filter((list: any) =>
    list.nm_lista.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <main className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center mb-10">
          <h1 className="font-pixel text-4xl text-white tracking-wider">Listas da Comunidade</h1>
          {isAuthenticated && (
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-[#2dd4bf] hover:bg-[#0d9488] text-black font-bold text-lg px-6 py-6 shadow-lg hover:shadow-[#2dd4bf]/50 transition-all"
            >
              <Plus className="w-6 h-6 mr-2" />
              Criar Lista
            </Button>
          )}
        </div>

        <div className="mb-10 relative max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2dd4bf]/60" />
          <Input
            placeholder="Buscar listas por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#0d241a] border-[#2dd4bf]/50 text-white h-12 focus:border-[#2dd4bf] focus:ring-4 focus:ring-[#2dd4bf]/30"
          />
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array(9).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl bg-[#0d241a]/50" />
            ))}
          </div>
        ) : filteredLists.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-2xl text-muted-foreground">Nenhuma lista encontrada.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredLists.map((list: any) => {
                const isOwner = Number(list.id_usuario) === Number(currentUser?.id_usuario);

                return (
                  <Link 
                    key={list.id_lista} 
                    to={`/list/${list.id_lista}`}
                    className="group block"
                  >
                    <div className="bg-[#0d241a]/60 border border-[#2dd4bf]/30 hover:border-[#2dd4bf]/70 transition-all duration-300 cursor-pointer h-full rounded-2xl overflow-hidden shadow-xl hover:shadow-[#2dd4bf]/40">
                      
                      {/* Mosaico de imagens dos jogos */}
                      <div className="flex h-44">
                        {list.lista_jogos && list.lista_jogos.length > 0 ? (
                          list.lista_jogos.slice(0, 4).map((gameId: number, index: number) => (
                            <div
                              key={index}
                              className="flex-1 bg-[#123a32] border-r border-[#2dd4bf]/10 last:border-r-0 overflow-hidden"
                            >
                              <img
                                src={gamesService.getImageUrl(gameId)} 
                                alt={`Jogo ${gameId}`}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  e.currentTarget.parentElement!.innerHTML = `
                                    <div class="w-full h-full flex items-center justify-center">
                                      <span class="font-pixel text-[10px] text-gray-500">Jogo</span>
                                    </div>
                                  `;
                                }}
                              />
                            </div>
                          ))
                        ) : (
                          [1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className="flex-1 bg-[#123a32] flex items-center justify-center border-r border-[#2dd4bf]/10 last:border-r-0"
                            >
                              <span className="font-pixel text-[10px] text-gray-500">?</span>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-pixel text-xl text-white group-hover:text-[#2dd4bf] transition-colors line-clamp-1">
                            {list.nm_lista}
                          </h3>
                        
                          {/* Botão de Deleção - visível apenas para o dono */}
                          {isOwner && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                onClick={(e) => handleDeleteList(list.id_lista, e)}
                                disabled={deleteListMutation.isPending}
                              >
                                <Trash2 className="w-5 h-5" />
                              </Button>
                          )}
                        </div>
                        <p className="text-muted-foreground line-clamp-2">
                          {list.descricao || "Lista sem descrição."}
                        </p>
                        <div className="mt-4 flex justify-between items-center text-sm">
                          <span className="text-[#2dd4bf] font-medium">
                            {list.total_jogos} Jogo(s)
                          </span>
                          <span className="text-gray-500">
                            Por: {list.nm_usuario}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
            })}
          </div>
        )}
      </main>

      {/* MODAL DE CRIAÇÃO DE LISTA */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-xl bg-[#0b1e19] border-2 border-[#2dd4bf] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-pixel text-3xl text-[#2dd4bf]">Criar Nova Lista</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="new-list-name" className="text-[#2dd4bf] font-bold">Nome da Lista</Label>
              <Input
                id="new-list-name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Ex: Meus jogos favoritos"
                className="bg-[#0d241a] border-[#2dd4bf]/50 text-white h-10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#2dd4bf] font-bold">Adicionar Jogos ({selectedGames.length})</Label>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Buscar jogos para adicionar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#0d241a] border-[#2dd4bf]/50 text-white h-10"
                />
              </div>

              <div className="max-h-60 overflow-y-auto border border-[#2dd4bf]/30 rounded-lg p-2 bg-[#0d241a]/50">
                {gamesLoading ? (
                    <p className="text-center text-gray-500 py-4"><Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Carregando jogos...</p>
                ) : filteredGames.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">Nenhum jogo encontrado.</p>
                ) : (
                    filteredGames.slice(0, 50).map((game: any) => (
                      <div
                        key={game.id_jogo}
                        className={`flex items-center p-2 rounded-md transition-colors cursor-pointer ${
                          selectedGames.includes(game.id_jogo) ? "bg-[#2dd4bf]/20" : "hover:bg-gray-700/50"
                        }`}
                      >
                        <Checkbox
                          id={`game-${game.id_jogo}`}
                          checked={selectedGames.includes(game.id_jogo)}
                          onCheckedChange={() => toggleGameSelection(game.id_jogo)}
                          className="border-[#2dd4bf]/50"
                        />
                        <label
                          htmlFor={`game-${game.id_jogo}`}
                          className="flex-1 cursor-pointer text-sm ml-3 text-white"
                        >
                          {game.nm_jogo}
                        </label>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setNewListName("");
                setSelectedGames([]);
              }}
              className="border-[#2dd4bf]/30 text-gray-300 hover:bg-[#0b1e19]"
            >
              <X className="w-4 h-4 mr-2" /> Cancelar
            </Button>
            <Button
              onClick={handleCreateList}
              disabled={createListMutation.isPending || selectedGames.length < 3 || !newListName.trim()}
              className="bg-[#2dd4bf] hover:bg-[#0d9488] text-black font-bold"
            >
              {createListMutation.isPending ? "Criando..." : "Criar Lista"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Lists;
