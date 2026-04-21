type TitleProps = {
  children: React.ReactNode;
};

export const Title = ({ children }: TitleProps) => {
  return (
    <div className="mb-8 relative">
      <h3 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
        {children}
      </h3>
      <div className="w-16 h-1 bg-gradient-to-r from-accent via-accent to-accent/40 rounded-full"></div>
    </div>
  );
};
