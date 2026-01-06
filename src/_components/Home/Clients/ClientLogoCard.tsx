import Image from "next/image";

type ClientLogoCardProps = {
  name: string;
  image: string;
};

export function ClientLogoCard({
  name,
  image,
}: ClientLogoCardProps) {
  return (
    <div className="group flex w-44 cursor-pointer flex-col items-center rounded-2xl bg-white p-4 text-center shadow-md transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex h-24 items-center justify-center">
        <Image
          src={image}
          alt={name}
          width={120}
          height={80}
          className="object-contain"
        />
      </div>

      <h6 className="mt-3 font-semibold text-gray-800">{name}</h6>
    </div>
  );
}
