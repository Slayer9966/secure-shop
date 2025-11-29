import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { User, Session } from "@supabase/supabase-js";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
}

const Products = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchCartCount();
            checkAdminRole();
          }, 0);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          fetchCartCount();
          checkAdminRole();
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const fetchCartCount = async () => {
    const { count } = await supabase
      .from("cart")
      .select("*", { count: "exact", head: true });
    setCartItemCount(count || 0);
  };

  const checkAdminRole = async () => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("role", "admin")
      .maybeSingle();
    setIsAdmin(!!data);
  };

  const handleAddToCart = async (productId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to add items to cart",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    const { data: existingItem } = await supabase
      .from("cart")
      .select("*")
      .eq("product_id", productId)
      .maybeSingle();

    if (existingItem) {
      const { error } = await supabase
        .from("cart")
        .update({ quantity: existingItem.quantity + 1 })
        .eq("id", existingItem.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update cart",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Cart updated",
        });
        fetchCartCount();
      }
    } else {
      const { error } = await supabase
        .from("cart")
        .insert({ product_id: productId, user_id: user.id, quantity: 1 });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add to cart",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Added to cart",
        });
        fetchCartCount();
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar cartItemCount={cartItemCount} isAdmin={isAdmin} user={user} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Products</h1>
          <p className="text-muted-foreground">Browse our collection of premium products</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 bg-card rounded-lg animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No products available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Products;