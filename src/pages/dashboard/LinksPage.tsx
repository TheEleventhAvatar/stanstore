import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  GripVertical,
  Trash2,
  ExternalLink,
  Link as LinkIcon,
  Save,
  Eye,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Link {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  is_active: boolean;
  position: number;
  click_count: number;
}

interface SortableLinkItemProps {
  link: Link;
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
}

const SortableLinkItem = ({ link, onToggle, onDelete }: SortableLinkItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <GlassCard className="flex items-center gap-4">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
          <LinkIcon className="w-5 h-5 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{link.title}</p>
          <p className="text-sm text-muted-foreground truncate">{link.url}</p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{link.click_count || 0} clicks</span>
        </div>

        <Switch
          checked={link.is_active}
          onCheckedChange={(checked) => onToggle(link.id, checked)}
        />

        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>

        <button
          onClick={() => onDelete(link.id)}
          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </GlassCard>
    </div>
  );
};

const LinksPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [links, setLinks] = useState<Link[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newLink, setNewLink] = useState({ title: "", url: "" });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const fetchLinks = async () => {
      if (!user) return;

      // Get user's store
      const { data: store } = await supabase
        .from("stores")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!store) {
        setLoading(false);
        return;
      }

      setStoreId(store.id);

      // Fetch links
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("store_id", store.id)
        .order("position", { ascending: true });

      if (error) {
        console.error("Error fetching links:", error);
      } else {
        setLinks(data || []);
      }
      setLoading(false);
    };

    fetchLinks();
  }, [user]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((l) => l.id === active.id);
      const newIndex = links.findIndex((l) => l.id === over.id);

      const newLinks = arrayMove(links, oldIndex, newIndex).map((link, index) => ({
        ...link,
        position: index,
      }));

      setLinks(newLinks);

      // Update positions in database
      setSaving(true);
      for (const link of newLinks) {
        await supabase.from("links").update({ position: link.position }).eq("id", link.id);
      }
      setSaving(false);
    }
  };

  const handleAddLink = async () => {
    if (!storeId || !user || !newLink.title || !newLink.url) return;

    const position = links.length;

    const { data, error } = await supabase
      .from("links")
      .insert({
        title: newLink.title,
        url: newLink.url.startsWith("http") ? newLink.url : `https://${newLink.url}`,
        store_id: storeId,
        user_id: user.id,
        position,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add link",
        variant: "destructive",
      });
    } else {
      setLinks([...links, data]);
      setNewLink({ title: "", url: "" });
      setDialogOpen(false);
      toast({
        title: "Link added",
        description: "Your link has been added successfully",
      });
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    const { error } = await supabase.from("links").update({ is_active: isActive }).eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update link",
        variant: "destructive",
      });
    } else {
      setLinks(links.map((l) => (l.id === id ? { ...l, is_active: isActive } : l)));
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("links").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete link",
        variant: "destructive",
      });
    } else {
      setLinks(links.filter((l) => l.id !== id));
      toast({
        title: "Link deleted",
        description: "Your link has been deleted",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!storeId) {
    return (
      <DashboardLayout>
        <GlassCard className="text-center py-12">
          <h2 className="text-xl font-bold mb-2">Set up your store first</h2>
          <p className="text-muted-foreground mb-4">
            You need to create your store before adding links.
          </p>
          <GradientButton onClick={() => (window.location.href = "/onboarding")}>
            Create Store
          </GradientButton>
        </GlassCard>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display">Links</h1>
            <p className="text-muted-foreground">
              Manage your link-in-bio links. Drag to reorder.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href={`/s/${storeId}`} target="_blank" rel="noopener noreferrer">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </a>
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <GradientButton>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Link
                </GradientButton>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Link</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="My Website"
                      value={newLink.title}
                      onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      placeholder="https://example.com"
                      value={newLink.url}
                      onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    />
                  </div>
                  <GradientButton className="w-full" onClick={handleAddLink}>
                    <Save className="w-4 h-4 mr-2" />
                    Add Link
                  </GradientButton>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Links List */}
        {links.length === 0 ? (
          <GlassCard className="text-center py-12">
            <LinkIcon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="font-medium mb-2">No links yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first link to get started.
            </p>
          </GlassCard>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {links.map((link) => (
                  <SortableLinkItem
                    key={link.id}
                    link={link}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {saving && (
          <p className="text-sm text-muted-foreground text-center">Saving changes...</p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LinksPage;
