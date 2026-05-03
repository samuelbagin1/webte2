<?php

namespace Database\Seeders;

use App\Models\DestinationType;
use Illuminate\Database\Seeder;

class DestinationTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['code' => 'sea_beach', 'name_sk' => 'More a pláž'],
            ['code' => 'mountains', 'name_sk' => 'Hory a príroda'],
            ['code' => 'historic', 'name_sk' => 'Historické mestá'],
            ['code' => 'city_break', 'name_sk' => 'Mestský výlet'],
            ['code' => 'adventure', 'name_sk' => 'Aktivity a dobrodružstvo'],
        ];

        foreach ($types as $type) {
            DestinationType::updateOrCreate(['code' => $type['code']], $type);
        }
    }
}
