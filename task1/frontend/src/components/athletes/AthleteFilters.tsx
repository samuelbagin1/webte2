import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterOption {
  id: number;
  name: string;
}

interface AthleteFiltersProps {
  years: number[];
  disciplines: FilterOption[];
  selectedYear: number | null;
  selectedDiscipline: number | null;
  onYearChange: (year: number | null) => void;
  onDisciplineChange: (discipline: number | null) => void;
}

export function AthleteFilters({ years, disciplines, selectedYear, selectedDiscipline, onYearChange, onDisciplineChange }: AthleteFiltersProps) {
  return (
    <div className="flex flex-wrap">
      
      {/* Year filter */}
      <div className="w-48">
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

      {/* Discipline/Category filter */}
      <div className="w-64">
        <Select
          value={selectedDiscipline?.toString() ?? "all"}
          onValueChange={(val) => onDisciplineChange(val === "all" ? null : Number(val))}
        >

          <SelectTrigger>
            <SelectValue placeholder="Kategória" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">Všetky kategórie</SelectItem>

            {disciplines.map((d) => (
              <SelectItem key={d.id} value={d.id.toString()}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>

        </Select>
      </div>

    </div>
  );
}