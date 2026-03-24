import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterOption {
  id: number;
  name: string;
}

interface AthleteFiltersProps {
  years: number[];
  disciplines: FilterOption[];
  selectedYear: number | null;
  selectedDiscipline: string | null;
  selectedType: string | null;
  selectedPlacing: number | null;
  onYearChange: (year: number | null) => void;
  onDisciplineChange: (discipline: string | null) => void;
  onTypeChange: (type: string | null) => void;
  onPlacingChange: (placing: number | null) => void;
}

export function AthleteFilters({ years, disciplines, selectedYear, selectedDiscipline, selectedType, selectedPlacing, onYearChange, onDisciplineChange, onTypeChange, onPlacingChange }: AthleteFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4">

      {/* Olympic type filter (LOH/ZOH) */}
      <div>
        <Select
          value={selectedType ?? "all"}
          onValueChange={(val) => onTypeChange(val === "all" ? null : val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Typ olympiády" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všetky typy</SelectItem>
            <SelectItem value="LOH">LOH (Letné)</SelectItem>
            <SelectItem value="ZOH">ZOH (Zimné)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Year filter */}
      <div>
        <Select
          value={selectedYear?.toString() ?? "all"}
          onValueChange={(val) => onYearChange(val === "all" ? null : Number(val))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Rok" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všetky roky</SelectItem>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Placement filter */}
      <div>
        <Select
          value={selectedPlacing?.toString() ?? "all"}
          onValueChange={(val) => onPlacingChange(val === "all" ? null : Number(val))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Umiestnenie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všetky umiestnenia</SelectItem>
            <SelectItem value="1">Zlato (1.)</SelectItem>
            <SelectItem value="2">Striebro (2.)</SelectItem>
            <SelectItem value="3">Bronz (3.)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Discipline/Category filter */}
      <div className="w-64">
        <Select
          value={selectedDiscipline ?? "all"}
          onValueChange={(val) => onDisciplineChange(val === "all" ? null : val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Kategória" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všetky kategórie</SelectItem>
            {disciplines.map((d) => (
              <SelectItem key={d.id} value={d.name}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

    </div>
  );
}
