import { Title } from "./title";
import * as motion from "motion/react-client";

const titleVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export const AnimatedTitle = ({ title }: { title: string }) => {
  return (
    <motion.div
      variants={titleVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <Title>{title}</Title>
    </motion.div>
  );
};
