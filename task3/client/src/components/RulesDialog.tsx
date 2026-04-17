import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface RulesDialogProps {
  open: boolean;
  onClose: () => void;
}

const RULES = [
  'Each player throws 5 stones alternately toward the target.',
  'Aim by clicking and dragging your stone — release to shoot (slingshot mechanic).',
  'Stones slide with friction and bounce off walls.',
  'After all stones stop, the player whose stone is closest to the bullseye wins.',
  'You can pause the game at any time; your opponent must resume together.',
  'Both players must agree to restart.',
];

export function RulesDialog({ open, onClose }: RulesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-card border-border-default max-w-md">
        <DialogHeader>
          <DialogTitle className="text-text-primary text-xl">How to Play</DialogTitle>
        </DialogHeader>
        <ol className="mt-2 space-y-3 list-decimal list-inside text-text-secondary text-sm leading-relaxed">
          {RULES.map((rule, i) => (
            <li key={i}>{rule}</li>
          ))}
        </ol>
      </DialogContent>
    </Dialog>
  );
}
