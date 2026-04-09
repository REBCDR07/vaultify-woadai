import { useNavigate } from "react-router-dom";
import { CATEGORIES } from "@/lib/constants";

const CategoryGrid = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.label}
          onClick={() => navigate(`/results?q=${encodeURIComponent(cat.query)}`)}
          className="rounded-lg border border-border bg-card px-3 py-2.5 text-center font-label text-xs font-medium text-muted-foreground card-hover hover:text-foreground"
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryGrid;
