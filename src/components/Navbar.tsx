import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, LogOut, LayoutDashboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface NavbarProps {
  cartItemCount?: number;
  isAdmin?: boolean;
  user: any;
}

const Navbar = ({ cartItemCount = 0, isAdmin = false, user }: NavbarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    } else {
      navigate("/auth");
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    }
  };

  return (
    <nav className="border-b border-border bg-card sticky top-0 z-50 backdrop-blur-lg bg-card/80">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
            ShopHub
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/cart">
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {cartItemCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                <Link to="/orders">
                  <Button variant="ghost" size="sm">
                    Orders
                  </Button>
                </Link>

                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}

                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;