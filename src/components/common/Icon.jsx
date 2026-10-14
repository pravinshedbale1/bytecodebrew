import { Network, Binary, Cpu, MessagesSquare, BookOpen } from 'lucide-react';

const icons = {
  network: Network,
  binary: Binary,
  cpu: Cpu,
  messages: MessagesSquare,
};

/** Maps curriculum icon names to icon components so data files stay framework-free. */
export function Icon({ name, size = 20, ...rest }) {
  const Component = icons[name] ?? BookOpen;
  return <Component size={size} strokeWidth={1.75} aria-hidden="true" {...rest} />;
}
