import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Edit, Trash2, X, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gamesService, type Game, type CreateGameData } from "@/services/games";
import { useAuth } from "@/hooks/useAuth";

type ActiveFilter = { 
  id: string; 
  type: 'ano' | 'genero' | 'plataforma' | 'nota'; 
  value: string;
  label: string;
};

const Games = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [platform, setPlatform] = useState("");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [minimumRating, setMinimumRating] = useState(0);
  const [ratingHover, setRatingHover] = useState<number | null>(null);
  const { user } = useAuth();

  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [filtersMenuOpen, setFiltersMenuOpen] = useState(false);
  
  // CRUD States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  
  // Form States
  const [formData, setFormData] = useState<CreateGameData>({
    nm_jogo: "",
    genero: "",
    classificacao: "",
    dt_jogo: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const queryClient = useQueryClient();

  const { data: games = [], isLoading } = useQuery({
    queryKey: ['games'],
    queryFn: gamesService.getAll,
  });

  // ✅ VERIFICAÇÃO DE PERMISSÃO DE ADMIN
  const isAdmin = user?.tipo_usuario === 'admin';

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateGameData) => gamesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      setIsCreateModalOpen(false);
      resetForm();
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateGameData> }) => 
      gamesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      setIsEditModalOpen(false);
      resetForm();
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => gamesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      setIsDeleteModalOpen(false);
      setSelectedGame(null);
    },
  });

  const resetForm = () => {
    setFormData({
      nm_jogo: "",
      genero: "",
      classificacao: "",
      dt_jogo: "",
    });
    setImageFile(null);
    setSelectedGame(null);
  };

  const handleCreate = () => {
    const data: CreateGameData = {
      ...formData,
      img_jogo: imageFile || undefined,
    };
    createMutation.mutate(data);
  };

  const handleEdit = () => {
    if (!selectedGame) return;
    
    const data: Partial<CreateGameData> = {};
    if (formData.nm_jogo) data.nm_jogo = formData.nm_jogo;
    if (formData.genero) data.genero = formData.genero;
    if (formData.classificacao) data.classificacao = formData.classificacao;
    if (formData.dt_jogo) data.dt_jogo = formData.dt_jogo;
    if (imageFile) data.img_jogo = imageFile;

    updateMutation.mutate({ id: selectedGame.id_jogo, data });
  };

  const handleDelete = () => {
    if (!selectedGame) return;
    deleteMutation.mutate(selectedGame.id_jogo);
  };

  const openEditModal = (game: Game) => {
    setSelectedGame(game);
    setFormData({
      nm_jogo: game.nm_jogo,
      genero: game.genero,
      classificacao: game.classificacao,
      dt_jogo: game.dt_jogo.split('T')[0],
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (game: Game) => {
    setSelectedGame(game);
    setIsDeleteModalOpen(true);
  };

  // Atualizar filtros ativos
  const updateActiveFilters = () => {
    const filters: ActiveFilter[] = [];
    
    if (year) {
      filters.push({ id: 'year', type: 'ano', value: year, label: `Ano: ${year}` });
    }
    if (genre) {
      const genreLabels: Record<string, string> = {
        'acao': 'Ação',
        'aventura': 'Aventura',
        'rpg': 'RPG',
        'terror': 'Terror',
        'esporte': 'Esporte',
        'corrida': 'Corrida',
        'luta': 'Luta',
        'indie': 'Indie'
      };
      filters.push({ id: 'genre', type: 'genero', value: genre, label: `Gênero: ${genreLabels[genre] || genre}` });
    }
    if (minimumRating > 0) {
      filters.push({ id: 'rating', type: 'nota', value: minimumRating.toString(), label: `Nota: ${minimumRating}+` });
    }
    if (platform) {
      const platformLabels: Record<string, string> = {
        'pc': 'PC',
        'playstation': 'PlayStation',
        'xbox': 'Xbox',
        'switch': 'Nintendo Switch',
        'mobile': 'Mobile'
      };
      filters.push({ id: 'platform', type: 'plataforma', value: platform, label: `Plataforma: ${platformLabels[platform] || platform}` });
    }
    
    setActiveFilters(filters);
  };

  useEffect(() => {
    updateActiveFilters();
  }, [year, genre, minimumRating, platform]);

  useEffect(() => {
    if (year || genre || minimumRating > 0 || platform) {
      setFiltersMenuOpen(false);
    }
  }, [year, genre, minimumRating, platform]);

  const removeFilter = (filterId: string) => {
    const filter = activeFilters.find(f => f.id === filterId);
    if (!filter) return;

    switch (filter.type) {
      case 'ano':
        setYear("");
        break;
      case 'genero':
        setGenre("");
        break;
      case 'nota':
        setMinimumRating(0);
        break;
      case 'plataforma':
        setPlatform("");
        break;
    }
  };

  const clearAllFilters = () => {
    setPlatform("");
    setGenre("");
    setYear("");
    setMinimumRating(0);
    setSearchTerm("");
    setActiveFilters([]);
  };

  const filteredGames = games.filter((game) => {
    const matchesSearch = game.nm_jogo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = !genre || game.genero.toLowerCase().includes(genre.toLowerCase());
    const matchesYear = !year || new Date(game.dt_jogo).getFullYear().toString() === year;
    return matchesSearch && matchesGenre && matchesYear;
  });

  return (
    <div className="min-h-screen pt-16">
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="pt-16 pb-20">
          <h1 className="text-center text-5xl font-bold mb-14 tracking-widest drop-shadow-[0_0_15px_#2dd4bf]">
            Biblioteca de Jogos
          </h1>

          <div className="max-w-6xl mx-auto mb-8">
            <div className="flex items-center gap-3 bg-[#0b1e19] border border-[#2dd4bf]/20 rounded-2xl p-3 shadow-xl shadow-black/30">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Digite o nome do jogo"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-4 pr-4 py-6 text-base bg-transparent border-none 
                            focus:ring-0 focus:outline-none text-white placeholder:text-gray-400
                            focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              <Button
                size="lg"
                className="bg-white hover:bg-gray-200 text-black font-medium px-8 rounded-xl
                          transition-all duration-300 shadow-lg hover:shadow-white/50"
              >
                <Search className="w-5 h-5" />
              </Button>

              <Button
                size="lg"
                onClick={() => setFiltersMenuOpen(!filtersMenuOpen)}
                className="bg-[#2dd4bf] hover:bg-[#0d9488] text-black font-bold px-8 rounded-xl
                          transition-all duration-300 shadow-lg hover:shadow-[#2dd4bf]/50 flex items-center gap-2"
              >
                <span>Filtros</span>
                <SlidersHorizontal className="w-4 h-4" />
              </Button>

              {isAdmin && (
                <Button
                  size="lg"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-[#2dd4bf] hover:bg-[#0d9488] text-black font-bold px-6 rounded-xl
                            transition-all duration-300 shadow-lg hover:shadow-[#2dd4bf]/50"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              )}
            </div>

            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                {activeFilters.map((filter) => (
                  <div
                    key={filter.id}
                    className="flex items-center gap-2 bg-[#3b82f6] text-white px-4 py-2 rounded-full
                              text-sm font-medium shadow-md hover:bg-[#2563eb] transition-all duration-200
                              animate-in fade-in zoom-in-95"
                  >
                    <span>{filter.label}</span>
                    <button
                      onClick={() => removeFilter(filter.id)}
                      className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {activeFilters.length > 1 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-[#2dd4bf] hover:text-white text-sm font-medium underline
                              transition-colors duration-200"
                  >
                    Limpar todos
                  </button>
                )}
              </div>
            )}

            {filtersMenuOpen && (
              <div className="bg-[#0b1e19] border border-[#2dd4bf]/20 rounded-2xl p-8 mt-4 shadow-xl shadow-black/30
                            animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 font-medium">Plataforma</label>
                    <Select value={platform} onValueChange={setPlatform}>
                      <SelectTrigger className="bg-[#0d241a]/80 border-white/30 
                                              hover:border-white focus:border-white focus:ring-white
                                              text-white h-12 rounded-lg">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a1f17] border-[#2dd4bf]/20">
                        <SelectItem value="pc" className="focus:bg-[#2dd4bf]/20 focus:text-[#2dd4bf]">PC</SelectItem>
                        <SelectItem value="playstation" className="focus:bg-[#2dd4bf]/20 focus:text-[#2dd4bf]">PlayStation</SelectItem>
                        <SelectItem value="xbox" className="focus:bg-[#2dd4bf]/20 focus:text-[#2dd4bf]">Xbox</SelectItem>
                        <SelectItem value="switch" className="focus:bg-[#2dd4bf]/20 focus:text-[#2dd4bf]">Nintendo Switch</SelectItem>
                        <SelectItem value="mobile" className="focus:bg-[#2dd4bf]/20 focus:text-[#2dd4bf]">Mobile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 font-medium">Gênero</label>
                    <Select value={genre} onValueChange={setGenre}>
                      <SelectTrigger className="bg-[#0d241a]/80 border-white/30 
                                              hover:border-white focus:border-white focus:ring-white
                                              text-white h-12 rounded-lg">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a1f17] border-[#2dd4bf]/20">
                        <SelectItem value="acao" className="focus:bg-[#2dd4bf]/20 focus:text-[#2dd4bf]">Ação</SelectItem>
                        <SelectItem value="aventura" className="focus:bg-[#2dd4bf]/20 focus:text-[#2dd4bf]">Aventura</SelectItem>
                        <SelectItem value="rpg" className="focus:bg-[#2dd4bf]/20 focus:text-[#2dd4bf]">RPG</SelectItem>
                        <SelectItem value="terror" className="focus:bg-[#2dd4bf]/20 focus:text-[#2dd4bf]">Terror</SelectItem>
                        <SelectItem value="esporte" className="focus:bg-[#2dd4bf]/20 focus:text-[#2dd4bf]">Esporte</SelectItem>
                        <SelectItem value="corrida" className="focus:bg-[#2dd4bf]/20 focus:text-[#2dd4bf]">Corrida</SelectItem>
                        <SelectItem value="luta" className="focus:bg-[#2dd4bf]/20 focus:text-[#2dd4bf]">Luta</SelectItem>
                        <SelectItem value="indie" className="focus:bg-[#2dd4bf]/20 focus:text-[#2dd4bf]">Indie</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 font-medium">Ano</label>
                    <Select value={year} onValueChange={setYear}>
                      <SelectTrigger className="bg-[#0d241a]/80 border-white/30 
                                              hover:border-white focus:border-white focus:ring-white
                                              text-white h-12 rounded-lg">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a1f17] border-[#2dd4bf]/20 max-h-64 overflow-y-auto">
                        {Array.from({ length: new Date().getFullYear() - 1958 + 1 }, (_, i) => {
                          const yearValue = new Date().getFullYear() - i;
                          return (
                            <SelectItem 
                              key={yearValue} 
                              value={yearValue.toString()}
                              className="focus:bg-[#2dd4bf]/20 focus:text-[#2dd4bf]"
                            >
                              {yearValue}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-400 font-medium">Nota mínima</label>
                    <div 
                      className="flex gap-1 cursor-pointer select-none bg-[#0d241a]/80 border border-white/30 
                                hover:border-white rounded-lg p-3 justify-center h-12 items-center"
                      onMouseLeave={() => setRatingHover(null)}
                    >
                      {Array.from({ length: 5 }).map((_, i) => {
                        const starValue = i + 1;
                        const currentRating = ratingHover !== null ? ratingHover : minimumRating;
                        
                        return (
                          <div
                            key={i}
                            className="relative w-6 h-6"
                            onMouseMove={(e) => {
                              const { left, width } = e.currentTarget.getBoundingClientRect();
                              const x = e.clientX - left;
                              const half = x < width / 2;
                              const newRating = half ? starValue - 0.5 : starValue;
                              setRatingHover(newRating);
                            }}
                            onClick={(e) => {
                              const { left, width } = e.currentTarget.getBoundingClientRect();
                              const x = e.clientX - left;
                              const half = x < width / 2;
                              const newRating = half ? starValue - 0.5 : starValue;
                              setMinimumRating(newRating);
                              setRatingHover(null);
                            }}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill={currentRating >= starValue ? "white" : "#374151"}
                              className="absolute top-0 left-0 w-6 h-6 transition-all duration-200 hover:scale-110"
                            >
                              <path d="M12 .587l3.668 7.568L24 9.748l-6 5.848L19.335 24 12 19.897 4.665 24 6 15.596 0 9.748l8.332-1.593z" />
                            </svg>
                            
                            {currentRating === starValue - 0.5 && (
                              <svg
                                viewBox="0 0 24 24"
                                fill="white"
                                className="absolute top-0 left-0 w-6 h-6 overflow-hidden transition-all duration-200"
                                style={{ clipPath: "inset(0 50% 0 0)" }}
                              >
                                <path d="M12 .587l3.668 7.568L24 9.748l-6 5.848L19.335 24 12 19.897 4.665 24 6 15.596 0 9.748l8.332-1.593z" />
                              </svg>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Carregando jogos...
              </div>
            ) : filteredGames.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Nenhum jogo encontrado
              </div>
            ) : (
              filteredGames.map((game) => (
                <div key={game.id_jogo} className="bg-glass border border-border rounded-xl overflow-hidden hover:bg-card-hover hover:border-accent/30 transition-all group">
                  <Link to={`/game/${game.id_jogo}`}>
                    <div className="aspect-[3/4] bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
                      {game.tem_imagem ? (
                        <img 
                          src={gamesService.getImageUrl(game.id_jogo)} 
                          alt={game.nm_jogo}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-pixel text-xs text-muted-foreground">POSTER</span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-pixel text-xs text-foreground mb-2 leading-relaxed line-clamp-2 group-hover:text-accent transition-colors">
                        {game.nm_jogo}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{new Date(game.dt_jogo).getFullYear()}</span>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {game.genero} • {game.classificacao}
                      </div>
                    </div>
                  </Link>
                  
                  {isAdmin && (
                    <div className="p-4 pt-0 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault();
                          openEditModal(game);
                        }}
                        className="flex-1"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.preventDefault();
                          openDeleteModal(game);
                        }}
                        className="flex-1 text-red-500 hover:text-red-600 hover:border-red-500"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Deletar
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Jogo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nm_jogo">Nome do Jogo</Label>
                <Input
                  id="nm_jogo"
                  value={formData.nm_jogo}
                  onChange={(e) => setFormData({ ...formData, nm_jogo: e.target.value })}
                  placeholder="Digite o nome do jogo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="genero">Gênero</Label>
                <Input
                  id="genero"
                  value={formData.genero}
                  onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                  placeholder="Ex: Ação/Aventura"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="classificacao">Classificação</Label>
                <Input
                  id="classificacao"
                  value={formData.classificacao}
                  onChange={(e) => setFormData({ ...formData, classificacao: e.target.value })}
                  placeholder="Ex: 18+"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dt_jogo">Data de Lançamento</Label>
                <Input
                  id="dt_jogo"
                  type="date"
                  value={formData.dt_jogo}
                  onChange={(e) => setFormData({ ...formData, dt_jogo: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="img_jogo">Imagem do Jogo</Label>
                <Input
                  id="img_jogo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending || !formData.nm_jogo}
                className="bg-accent hover:bg-accent/90"
              >
                {createMutation.isPending ? "Criando..." : "Criar Jogo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Editar Jogo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_nm_jogo">Nome do Jogo</Label>
                <Input
                  id="edit_nm_jogo"
                  value={formData.nm_jogo}
                  onChange={(e) => setFormData({ ...formData, nm_jogo: e.target.value })}
                  placeholder="Digite o nome do jogo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_genero">Gênero</Label>
                <Input
                  id="edit_genero"
                  value={formData.genero}
                  onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                  placeholder="Ex: Ação/Aventura"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_classificacao">Classificação</Label>
                <Input
                  id="edit_classificacao"
                  value={formData.classificacao}
                  onChange={(e) => setFormData({ ...formData, classificacao: e.target.value })}
                  placeholder="Ex: 18+"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_dt_jogo">Data de Lançamento</Label>
                <Input
                  id="edit_dt_jogo"
                  type="date"
                  value={formData.dt_jogo}
                  onChange={(e) => setFormData({ ...formData, dt_jogo: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_img_jogo">Nova Imagem (opcional)</Label>
                <Input
                  id="edit_img_jogo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleEdit}
                disabled={updateMutation.isPending}
                className="bg-accent hover:bg-accent/90"
              >
                {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Tem certeza que deseja deletar o jogo <strong>{selectedGame?.nm_jogo}</strong>? 
                Esta ação não pode ser desfeita.
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedGame(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {deleteMutation.isPending ? "Deletando..." : "Deletar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};
export default Games;
