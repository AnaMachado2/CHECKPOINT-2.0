// src/components/CreateListModal.tsx
import { useState } from "react";
import { Check, Search, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listsService } from "@/services/lists";
import { gamesService } from "@/services/games";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Game {
  id_jogo: number;
  nm_jogo: string;
  genero?: string;
  dt_jogo?: string;
  tem_imagem?: boolean;
}

const CATEGORIES = [
  { id: "top-jogos", label: "Top Jogos", icon: "Trophy" },
  { id: "tematica", label: "Temática", icon: "Masks" },
  { id: "genero", label: "Gênero", icon: "Gamepad" },
  { id: "ano", label: "Por Ano", icon: "Calendar" },
  { id: "plataforma", label: "Plataforma", icon: "Target" },
  { id: "recomendacao", label: "Recomendação", icon: "Star" },
];

export function CreateListModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [listTitle, setListTitle] = useState("");
  const [listDescription, setListDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [gameSearchQuery, setGameSearchQuery] = useState("");
  const [selectedGames, setSelectedGames] = useState<Game[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: availableGames = [] } = useQuery({
    queryKey: ["games"],
    queryFn: gamesService.getAll,
  });

  const filteredGames = availableGames.filter((game: Game) =>
    game.nm_jogo.toLowerCase().includes(gameSearchQuery.toLowerCase())
  );

  const resetForm = () => {
    setListTitle("");
    setListDescription("");
    setSelectedCategory("");
    setSelectedGames([]);
    setGameSearchQuery("");
  };

  const toggleGameSelection = (game: Game) => {
    setSelectedGames((prev) => {
      const exists = prev.some((g) => g.id_jogo === game.id_jogo);
      if (exists) return prev.filter((g) => g.id_jogo !== game.id_jogo);
      if (prev.length >= 50) {
        toast({ title: "Limite atingido", description: "Máximo de 50 jogos por lista", variant: "destructive" });
        return prev;
      }
      return [...prev, game];
    });
  };

  const removeGame = (id: number) => {
    setSelectedGames((prev) => prev.filter((g) => g.id_jogo !== id));
  };

  const createListMutation = useMutation({
    mutationFn: async (data: any) => listsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lists"] });
      queryClient.invalidateQueries({ queryKey: ["user-lists", user?.id_usuario?.toString()] });
      setShowSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        setShowSuccess(false);
        resetForm();
        toast({ title: "Sucesso!", description: "Lista criada com sucesso!" });
      }, 1500);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.erro || "Erro ao criar lista",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!user) return toast({ title: "Erro", description: "Você precisa estar logado", variant: "destructive" });
    if (listTitle.trim().length === 0) return toast({ title: "Erro", description: "Digite um nome para a lista", variant: "destructive" });
    if (selectedGames.length < 3) return toast({ title: "Erro", description: "Adicione pelo menos 3 jogos", variant: "destructive" });

    createListMutation.mutate({
      nm_lista: listTitle,
      lista_jogos: selectedGames.map((g) => g.id_jogo),
      categoria: selectedCategory || null,
      descricao: listDescription || null,
    });
  };

  const isFormValid = listTitle.trim() !== "" && selectedGames.length >= 3;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-2 border-border">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="font-pixel text-2xl text-[#2dd4bf]">
            Criar Nova Lista
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Crie uma coleção personalizada de jogos
          </DialogDescription>
        </DialogHeader>

        {showSuccess && (
          <div className="p-6 bg-[#2dd4bf]/10 border-2 border-[#2dd4bf] rounded-xl text-[#2dd4bf] font-bold text-center text-xl">
            Lista criada com sucesso!
          </div>
        )}

        <div className="space-y-6 py-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label className="text-[#2dd4bf] font-bold">Nome da Lista</Label>
            <Input
              value={listTitle}
              onChange={(e) => setListTitle(e.target.value.slice(0, 100))}
              placeholder="Ex: Melhores RPGs 2024"
              className="h-12 text-lg border-[#2dd4bf]/50 focus:border-[#2dd4bf]"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label className="text-[#2dd4bf] font-bold">Descrição (opcional)</Label>
            <Textarea
              value={listDescription}
              onChange={(e) => setListDescription(e.target.value.slice(0, 300))}
              placeholder="Sobre o que é essa lista?"
              className="min-h-24 resize-none"
            />
          </div>

          {/* Categoria */}
          <div className="space-y-3">
            <Label className="text-[#2dd4bf] font-bold">Categoria</Label>
            <div className="grid grid-cols-3 gap-3">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedCategory === c.id
                      ? "bg-[#2dd4bf]/20 border-[#2dd4bf] text-[#2dd4bf] shadow-lg shadow-[#2dd4bf]/30"
                      : "border-gray-700 hover:border-[#2dd4bf]/50 hover:bg-[#2dd4bf]/5"
                  }`}
                >
                  <div className="text-3xl mb-1">{c.icon}</div>
                  <div className="text-xs font-medium">{c.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Buscar jogos */}
          <div className="space-y-3">
            <Label className="text-[#2dd4bf] font-bold">Adicionar Jogos</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2dd4bf]/60" />
              <Input
                value={gameSearchQuery}
                onChange={(e) => setGameSearchQuery(e.target.value)}
                placeholder="Buscar jogos..."
                className="pl-11 h-12 border-[#2dd4bf]/50 focus:border-[#2dd4bf]"
              />
            </div>
            <div className="max-h-64 overflow-y-auto border border-[#2dd4bf]/30 rounded-lg p-2 bg-[#0d241a]/50">
              {filteredGames.slice(0, 15).map((game) => {
                const isSelected = selectedGames.some((g) => g.id_jogo === game.id_jogo);
                return (
                  <div
                    key={game.id_jogo}
                    onClick={() => toggleGameSelection(game)}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#2dd4bf]/20 border border-[#2dd4bf]"
                        : "hover:bg-[#2dd4bf]/10"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white">{game.nm_jogo}</div>
                      <div className="text-xs text-gray-400">
                        {game.dt_jogo ? new Date(game.dt_jogo).getFullYear() : "????"} • {game.genero || "Sem gênero"}
                      </div>
                    </div>
                    {isSelected && <Check className="w-6 h-6 text-[#2dd4bf]" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Jogos selecionados */}
          <div className="space-y-3">
            <Label className="text-[#2dd4bf] font-bold">
              Jogos Selecionados ({selectedGames.length}/50)
            </Label>
            <div className="min-h-24 p-4 border border-[#2dd4bf]/30 rounded-lg bg-[#0d241a]/50">
              {selectedGames.length === 0 ? (
                <p className="text-center text-gray-500">Nenhum jogo selecionado</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedGames.map((g) => (
                    <div
                      key={g.id_jogo}
                      className="flex items-center gap-2 px-4 py-2 bg-[#2dd4bf]/20 border border-[#2dd4bf]/50 rounded-full text-sm font-medium"
                    >
                      {g.nm_jogo}
                      <button onClick={() => removeGame(g.id_jogo)} className="ml-2">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4">
            <Button variant="outline" className="flex-1 h-12 text-lg" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              className="flex-1 h-12 text-lg bg-[#2dd4bf] hover:bg-[#0d9488] text-black font-bold"
              disabled={!isFormValid || createListMutation.isPending}
              onClick={handleSubmit}
            >
              {createListMutation.isPending ? "Criando..." : "Criar Lista"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
