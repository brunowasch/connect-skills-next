type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  text: string;
};

export function FeatureCard({ icon, title, text }: FeatureCardProps) {
  return (
    <div className="flex h-full flex-col items-center rounded-2xl bg-white p-6 text-center shadow-md transition hover:-translate-y-1 hover:shadow-lg">
      <div className="text-4xl text-blue-600">{icon}</div>

      <p className="mt-4 text-gray-700">
        <strong className="block text-gray-900">{title}</strong>
        {text}
      </p>
    </div>
  );
}
