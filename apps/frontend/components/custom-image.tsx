import Image from "next/image";
import Decorations from "./ui/decorations";

const CustomImage = (props: React.ComponentProps<typeof Image>) => {
  return (
    <div className="relative h-full w-full">
        <Decorations/>
      <Image {...props} />
    </div>
  );
};

export default CustomImage;
