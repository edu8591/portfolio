type TitleProps = {
  children: React.ReactNode;
};

export const Title = ({ children }: TitleProps) => {
  return (
    <h3 className="mb-3 text-2xl font-semibold block md:hidden">{children}</h3>
  );
};
