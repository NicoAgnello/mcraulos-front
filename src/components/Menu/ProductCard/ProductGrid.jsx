import { ProductCard } from "./ProductCard.jsx";

export const ProductGrid = ({ items = [], onAdd, className = "" }) => {
  return (
    <section
      className={`grid mt-5 gap-4 sm:gap-5 md:gap-6
                  grid-cols-2 xs:grid-cols-2 md:grid-cols-2 2xl:grid-cols-2 ${className}`}
    >
      {items.map((p) => (
        <ProductCard key={p.id} product={p} onAdd={onAdd} />
      ))}
    </section>
  );
};
