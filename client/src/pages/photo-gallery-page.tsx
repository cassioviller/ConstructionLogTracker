import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NavigationSidebar from "@/components/navigation-sidebar";
import MobileFooterNav from "@/components/mobile-footer-nav";
import { ChevronLeft, Search, Filter, Image, Grid, List, Upload } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PhotoUploadSection from "@/components/photo-upload-section";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const PhotoGalleryPage = () => {
  const { id } = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRdo, setFilterRdo] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [photoDetailOpen, setPhotoDetailOpen] = useState(false);

  // Get project details
  const { data: project, isLoading: isLoadingProject } = useQuery({
    queryKey: [`/api/projects/${id}`],
    queryFn: async () => {
      return {
        id,
        name: "Edifício Corporativo Central",
      };
    },
  });

  // Get project RDOs for filter dropdown
  const { data: rdos, isLoading: isLoadingRDOs } = useQuery({
    queryKey: [`/api/projects/${id}/rdos`],
    queryFn: async () => {
      return [];
    },
  });

  // Get project photos with filtering
  const { data: photoData, isLoading: isLoadingPhotos } = useQuery({
    queryKey: [`/api/projects/${id}/photos`, searchTerm, filterRdo],
    queryFn: async () => {
      return [];
    },
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const handlePhotoUpload = async () => {
    if (photos.length === 0) {
      toast({
        title: "Nenhuma foto selecionada",
        description: "Por favor, selecione pelo menos uma foto para upload.",
        variant: "destructive",
      });
      return;
    }

    // In a real implementation, we would upload the files to a server
    // For this demo, we'll just show a success message
    toast({
      title: "Fotos enviadas com sucesso",
      description: `${photos.length} foto(s) adicionadas à galeria.`,
    });

    // Clean up
    setPhotos([]);
    setUploadDialogOpen(false);

    // Refresh photos
    queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}/photos`] });
  };

  const handleViewPhoto = (photo: any) => {
    setSelectedPhoto(photo);
    setPhotoDetailOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button 
          onClick={() => setSidebarOpen(true)} 
          className="p-2 rounded-md text-slate-500 hover:bg-slate-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center space-x-2">
          <span className="font-bold text-lg text-primary">Meu Diário de Obra Pro</span>
        </div>
      </header>

      <div className="flex flex-1">
        <NavigationSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto pb-16 lg:pb-6">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/projects/${id}`)}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Galeria de Fotos</h1>
              <p className="text-slate-500">{project?.name}</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <div className="w-full md:w-auto flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <Input 
                  placeholder="Buscar fotos por legenda..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
              <div className="w-full sm:w-auto">
                <Select value={filterRdo} onValueChange={setFilterRdo}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Todos os RDOs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os RDOs</SelectItem>
                    {rdos?.map((rdo: any) => (
                      <SelectItem key={rdo.id} value={rdo.id.toString()}>
                        RDO #{rdo.reportNumber} - {formatDate(rdo.date)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center border rounded-md overflow-hidden">
                <Button 
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Adicionar Fotos
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Adicionar Fotos</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <PhotoUploadSection 
                      photos={photos}
                      onChange={setPhotos}
                    />
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setUploadDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button onClick={handlePhotoUpload}>
                      Upload
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-6">
              {isLoadingPhotos ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : photoData && photoData.length > 0 ? (
                viewMode === "grid" ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array(8).fill(0).map((_, i) => (
                      <div
                        key={i}
                        className="relative group rounded-md overflow-hidden border border-slate-200"
                        onClick={() => handleViewPhoto({ id: i, caption: `Foto ${i + 1}` })}
                      >
                        <div className="aspect-square bg-slate-200 flex items-center justify-center">
                          <Image className="h-10 w-10 text-slate-400" />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Visualizar
                          </Button>
                        </div>
                        <div className="p-2 bg-white">
                          <p className="text-sm text-slate-900 truncate">Foto {i + 1}</p>
                          <p className="text-xs text-slate-500">RDO #42 - 07/05/2023</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {Array(8).fill(0).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center py-4 hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => handleViewPhoto({ id: i, caption: `Foto ${i + 1}` })}
                      >
                        <div className="h-16 w-24 bg-slate-200 rounded-md flex items-center justify-center mr-4 flex-shrink-0">
                          <Image className="h-8 w-8 text-slate-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">Foto {i + 1}</p>
                          <p className="text-sm text-slate-500">
                            RDO #42 - 07/05/2023 | Adicionada por João Silva
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="ml-2"
                        >
                          Visualizar
                        </Button>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="py-12 text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <Image className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-1">Nenhuma foto encontrada</h3>
                  <p className="text-slate-500 mb-4 max-w-md mx-auto">
                    Adicione fotos ao criar um novo RDO ou use o botão acima para fazer upload diretamente.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button 
                      onClick={() => setUploadDialogOpen(true)}
                      variant="default"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Adicionar Fotos
                    </Button>
                    <Button 
                      onClick={() => navigate(`/projects/${id}/new-rdo`)}
                      variant="outline"
                    >
                      Criar RDO com Fotos
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
      
      {/* Photo Detail Dialog */}
      <Dialog open={photoDetailOpen} onOpenChange={setPhotoDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedPhoto?.caption || "Detalhes da Foto"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center">
            <div className="w-full aspect-square bg-slate-200 flex items-center justify-center rounded-md mb-4">
              <Image className="h-20 w-20 text-slate-400" />
            </div>
            <div className="w-full">
              <p className="text-sm text-slate-500 mb-2">
                <strong>Data:</strong> 07/05/2023 | <strong>RDO:</strong> #42
              </p>
              <p className="text-sm text-slate-500 mb-2">
                <strong>Adicionada por:</strong> João Silva
              </p>
              <p className="text-sm text-slate-700 mb-2">
                {selectedPhoto?.caption || "Sem legenda"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPhotoDetailOpen(false)}>
              Fechar
            </Button>
            <Button>
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <MobileFooterNav />
    </div>
  );
};

export default PhotoGalleryPage;
