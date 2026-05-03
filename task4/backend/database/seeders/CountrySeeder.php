<?php

namespace Database\Seeders;

use App\Models\Country;
use Illuminate\Database\Seeder;

class CountrySeeder extends Seeder
{
    public function run(): void
    {
        $countries = [
            ['iso_code' => 'AT', 'name_sk' => 'Rakúsko', 'capital' => 'Viedeň', 'currency_code' => 'EUR'],
            ['iso_code' => 'CH', 'name_sk' => 'Švajčiarsko', 'capital' => 'Bern', 'currency_code' => 'CHF'],
            ['iso_code' => 'CZ', 'name_sk' => 'Česko', 'capital' => 'Praha', 'currency_code' => 'CZK'],
            ['iso_code' => 'DE', 'name_sk' => 'Nemecko', 'capital' => 'Berlín', 'currency_code' => 'EUR'],
            ['iso_code' => 'DK', 'name_sk' => 'Dánsko', 'capital' => 'Kodaň', 'currency_code' => 'DKK'],
            ['iso_code' => 'EG', 'name_sk' => 'Egypt', 'capital' => 'Káhira', 'currency_code' => 'EGP'],
            ['iso_code' => 'ES', 'name_sk' => 'Španielsko', 'capital' => 'Madrid', 'currency_code' => 'EUR'],
            ['iso_code' => 'FR', 'name_sk' => 'Francúzsko', 'capital' => 'Paríž', 'currency_code' => 'EUR'],
            ['iso_code' => 'GB', 'name_sk' => 'Spojené kráľovstvo', 'capital' => 'Londýn', 'currency_code' => 'GBP'],
            ['iso_code' => 'GR', 'name_sk' => 'Grécko', 'capital' => 'Atény', 'currency_code' => 'EUR'],
            ['iso_code' => 'HR', 'name_sk' => 'Chorvátsko', 'capital' => 'Záhreb', 'currency_code' => 'EUR'],
            ['iso_code' => 'HU', 'name_sk' => 'Maďarsko', 'capital' => 'Budapešť', 'currency_code' => 'HUF'],
            ['iso_code' => 'IE', 'name_sk' => 'Írsko', 'capital' => 'Dublin', 'currency_code' => 'EUR'],
            ['iso_code' => 'IS', 'name_sk' => 'Island', 'capital' => 'Reykjavík', 'currency_code' => 'ISK'],
            ['iso_code' => 'IT', 'name_sk' => 'Taliansko', 'capital' => 'Rím', 'currency_code' => 'EUR'],
            ['iso_code' => 'JO', 'name_sk' => 'Jordánsko', 'capital' => 'Ammán', 'currency_code' => 'JOD'],
            ['iso_code' => 'MA', 'name_sk' => 'Maroko', 'capital' => 'Rabat', 'currency_code' => 'MAD'],
            ['iso_code' => 'MT', 'name_sk' => 'Malta', 'capital' => 'Valletta', 'currency_code' => 'EUR'],
            ['iso_code' => 'NL', 'name_sk' => 'Holandsko', 'capital' => 'Amsterdam', 'currency_code' => 'EUR'],
            ['iso_code' => 'NO', 'name_sk' => 'Nórsko', 'capital' => 'Oslo', 'currency_code' => 'NOK'],
            ['iso_code' => 'PL', 'name_sk' => 'Poľsko', 'capital' => 'Varšava', 'currency_code' => 'PLN'],
            ['iso_code' => 'PT', 'name_sk' => 'Portugalsko', 'capital' => 'Lisabon', 'currency_code' => 'EUR'],
            ['iso_code' => 'SE', 'name_sk' => 'Švédsko', 'capital' => 'Štokholm', 'currency_code' => 'SEK'],
            ['iso_code' => 'SI', 'name_sk' => 'Slovinsko', 'capital' => 'Ľubľana', 'currency_code' => 'EUR'],
            ['iso_code' => 'SK', 'name_sk' => 'Slovensko', 'capital' => 'Bratislava', 'currency_code' => 'EUR'],
            ['iso_code' => 'TR', 'name_sk' => 'Turecko', 'capital' => 'Ankara', 'currency_code' => 'TRY'],
        ];

        foreach ($countries as $country) {
            Country::updateOrCreate(['iso_code' => $country['iso_code']], $country);
        }
    }
}
