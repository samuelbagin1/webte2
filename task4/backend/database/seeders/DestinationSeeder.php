<?php

namespace Database\Seeders;

use App\Models\Country;
use App\Models\Destination;
use App\Models\DestinationType;
use Illuminate\Database\Seeder;

class DestinationSeeder extends Seeder
{
    public function run(): void
    {
        $countries = Country::query()->pluck('id', 'iso_code');
        $types = DestinationType::query()->pluck('id', 'code');

        foreach ($this->destinations() as $item) {
            $countryIso = $item['country_iso'];
            $typeCodes = $item['types'];
            unset($item['country_iso']);
            unset($item['types']);

            $destination = Destination::updateOrCreate(
                ['name' => $item['name']],
                [
                    ...$item,
                    'country_id' => $countries->get($countryIso),
                ],
            );

            $destination->types()->sync(
                collect($typeCodes)->map(fn (string $code) => $types->get($code))->filter()->values()->all(),
            );
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function destinations(): array
    {
        return [
            ['name' => 'Barcelona', 'country_iso' => 'ES', 'latitude' => 41.3874, 'longitude' => 2.1686, 'flight_hours_from_vienna' => 2.4, 'description_sk' => 'Katalánska metropola spája mestské pamiatky, Gaudího architektúru a pláže pri Stredozemnom mori.', 'image_url' => 'https://source.unsplash.com/1200x800/?barcelona,beach', 'types' => ['sea_beach', 'historic', 'city_break']],
            ['name' => 'Palma de Mallorca', 'country_iso' => 'ES', 'latitude' => 39.5696, 'longitude' => 2.6502, 'flight_hours_from_vienna' => 2.4, 'description_sk' => 'Slnečné Baleáry s plážami, prístavom a gotickou katedrálou v kompaktnom centre.', 'image_url' => 'https://source.unsplash.com/1200x800/?mallorca,beach', 'types' => ['sea_beach', 'city_break']],
            ['name' => 'Nice', 'country_iso' => 'FR', 'latitude' => 43.7102, 'longitude' => 7.2620, 'flight_hours_from_vienna' => 1.8, 'description_sk' => 'Azúrové pobrežie s promenádou, starým mestom a ľahkým výletom do Monaka či Cannes.', 'image_url' => 'https://source.unsplash.com/1200x800/?nice,france,coast', 'types' => ['sea_beach', 'city_break']],
            ['name' => 'Split', 'country_iso' => 'HR', 'latitude' => 43.5081, 'longitude' => 16.4402, 'flight_hours_from_vienna' => 1.3, 'description_sk' => 'Dalmátske mesto pri mori s Diokleciánovým palácom a ostrovmi na dosah trajektom.', 'image_url' => 'https://source.unsplash.com/1200x800/?split,croatia', 'types' => ['sea_beach', 'historic']],
            ['name' => 'Mykonos', 'country_iso' => 'GR', 'latitude' => 37.4467, 'longitude' => 25.3289, 'flight_hours_from_vienna' => 2.3, 'description_sk' => 'Kykladský ostrov s bielymi uličkami, veternými mlynmi a živými plážami.', 'image_url' => 'https://source.unsplash.com/1200x800/?mykonos,greece', 'types' => ['sea_beach']],
            ['name' => 'Antalya', 'country_iso' => 'TR', 'latitude' => 36.8969, 'longitude' => 30.7133, 'flight_hours_from_vienna' => 2.6, 'description_sk' => 'Turecká riviéra ponúka teplé more, all-inclusive rezorty a historické centrum Kaleici.', 'image_url' => 'https://source.unsplash.com/1200x800/?antalya,turkey', 'types' => ['sea_beach', 'historic']],
            ['name' => 'Hurghada', 'country_iso' => 'EG', 'latitude' => 27.2579, 'longitude' => 33.8116, 'flight_hours_from_vienna' => 3.8, 'description_sk' => 'Letovisko pri Červenom mori s celoročným teplom, koralmi a výbornými podmienkami na šnorchlovanie.', 'image_url' => 'https://source.unsplash.com/1200x800/?hurghada,red-sea', 'types' => ['sea_beach', 'adventure']],
            ['name' => 'Dubrovník', 'country_iso' => 'HR', 'latitude' => 42.6507, 'longitude' => 18.0944, 'flight_hours_from_vienna' => 1.4, 'description_sk' => 'Historické hradby nad Jadranom, kamenné uličky a výhľady z lanovky na Srď.', 'image_url' => 'https://source.unsplash.com/1200x800/?dubrovnik,croatia', 'types' => ['sea_beach', 'historic']],
            ['name' => 'Innsbruck', 'country_iso' => 'AT', 'latitude' => 47.2692, 'longitude' => 11.4041, 'flight_hours_from_vienna' => 1.0, 'description_sk' => 'Alpské mesto s lanovkami priamo z centra, zimnými športmi a výhľadmi na Nordkette.', 'image_url' => 'https://source.unsplash.com/1200x800/?innsbruck,alps', 'types' => ['mountains', 'city_break']],
            ['name' => 'Chamonix', 'country_iso' => 'FR', 'latitude' => 45.9237, 'longitude' => 6.8694, 'flight_hours_from_vienna' => 2.0, 'description_sk' => 'Ikonické horské stredisko pod Mont Blancom pre turistiku, lyžovanie a lanovku Aiguille du Midi.', 'image_url' => 'https://source.unsplash.com/1200x800/?chamonix,mont-blanc', 'types' => ['mountains', 'adventure']],
            ['name' => 'Zermatt', 'country_iso' => 'CH', 'latitude' => 46.0207, 'longitude' => 7.7491, 'flight_hours_from_vienna' => 2.2, 'description_sk' => 'Bezautové švajčiarske stredisko s výhľadom na Matterhorn a celoročnými horskými trasami.', 'image_url' => 'https://source.unsplash.com/1200x800/?zermatt,matterhorn', 'types' => ['mountains', 'adventure']],
            ['name' => 'Reykjavík', 'country_iso' => 'IS', 'latitude' => 64.1466, 'longitude' => -21.9426, 'flight_hours_from_vienna' => 4.3, 'description_sk' => 'Severská základňa pre gejzíry, vodopády, lávové polia a termálne kúpele.', 'image_url' => 'https://source.unsplash.com/1200x800/?reykjavik,iceland', 'types' => ['mountains', 'adventure', 'city_break']],
            ['name' => 'Bergen', 'country_iso' => 'NO', 'latitude' => 60.3913, 'longitude' => 5.3221, 'flight_hours_from_vienna' => 2.8, 'description_sk' => 'Nórske mesto medzi fjordmi a horami, známe dreveným nábrežím Bryggen.', 'image_url' => 'https://source.unsplash.com/1200x800/?bergen,norway,fjord', 'types' => ['mountains', 'historic']],
            ['name' => 'Tatranská Lomnica', 'country_iso' => 'SK', 'latitude' => 49.1667, 'longitude' => 20.2833, 'flight_hours_from_vienna' => 1.0, 'description_sk' => 'Vysokotatranská obec s prístupom na Skalnaté pleso, Lomnický štít a turistické chodníky.', 'image_url' => 'https://source.unsplash.com/1200x800/?high-tatras,slovakia', 'types' => ['mountains', 'adventure']],
            ['name' => 'Garmisch-Partenkirchen', 'country_iso' => 'DE', 'latitude' => 47.4917, 'longitude' => 11.0955, 'flight_hours_from_vienna' => 1.0, 'description_sk' => 'Bavorské horské mestečko pri Zugspitze s tiesňavou Partnachklamm a alpskou atmosférou.', 'image_url' => 'https://source.unsplash.com/1200x800/?garmisch,zugsptize', 'types' => ['mountains', 'historic']],
            ['name' => 'Rím', 'country_iso' => 'IT', 'latitude' => 41.9028, 'longitude' => 12.4964, 'flight_hours_from_vienna' => 1.6, 'description_sk' => 'Večné mesto s Koloseom, fórami, fontánami a kuchyňou, ktorá funguje celoročne.', 'image_url' => 'https://source.unsplash.com/1200x800/?rome,italy', 'types' => ['historic', 'city_break']],
            ['name' => 'Atény', 'country_iso' => 'GR', 'latitude' => 37.9838, 'longitude' => 23.7275, 'flight_hours_from_vienna' => 2.1, 'description_sk' => 'Kolíska antiky s Akropolou, múzeami, tavernami a rýchlym prístupom k moru.', 'image_url' => 'https://source.unsplash.com/1200x800/?athens,greece', 'types' => ['historic', 'city_break']],
            ['name' => 'Praha', 'country_iso' => 'CZ', 'latitude' => 50.0755, 'longitude' => 14.4378, 'flight_hours_from_vienna' => 1.0, 'description_sk' => 'Historické centrum s Pražským hradom, Karlovým mostom a živou kaviarenskou scénou.', 'image_url' => 'https://source.unsplash.com/1200x800/?prague,czech', 'types' => ['historic', 'city_break']],
            ['name' => 'Krakov', 'country_iso' => 'PL', 'latitude' => 50.0647, 'longitude' => 19.9450, 'flight_hours_from_vienna' => 1.0, 'description_sk' => 'Poľské kultúrne mesto s Rynekom, Wawelom a štvrťou Kazimierz.', 'image_url' => 'https://source.unsplash.com/1200x800/?krakow,poland', 'types' => ['historic', 'city_break']],
            ['name' => 'Istanbul', 'country_iso' => 'TR', 'latitude' => 41.0082, 'longitude' => 28.9784, 'flight_hours_from_vienna' => 2.3, 'description_sk' => 'Mesto medzi Európou a Áziou s mešitami, bazármi, Bosporom a bohatou gastronómiou.', 'image_url' => 'https://source.unsplash.com/1200x800/?istanbul,turkey', 'types' => ['historic', 'city_break']],
            ['name' => 'Budapešť', 'country_iso' => 'HU', 'latitude' => 47.4979, 'longitude' => 19.0402, 'flight_hours_from_vienna' => 1.0, 'description_sk' => 'Dunajská metropola s termálnymi kúpeľmi, parlamentom a výraznou večernou atmosférou.', 'image_url' => 'https://source.unsplash.com/1200x800/?budapest,hungary', 'types' => ['historic', 'city_break']],
            ['name' => 'Edinburgh', 'country_iso' => 'GB', 'latitude' => 55.9533, 'longitude' => -3.1883, 'flight_hours_from_vienna' => 2.7, 'description_sk' => 'Škótske hlavné mesto s hradom, stredovekými uličkami a výstupom na Arthur’s Seat.', 'image_url' => 'https://source.unsplash.com/1200x800/?edinburgh,scotland', 'types' => ['historic', 'city_break', 'mountains']],
            ['name' => 'Lisabon', 'country_iso' => 'PT', 'latitude' => 38.7223, 'longitude' => -9.1393, 'flight_hours_from_vienna' => 3.5, 'description_sk' => 'Slnečné mesto na kopcoch s električkami, vyhliadkami, fado a výletmi k Atlantiku.', 'image_url' => 'https://source.unsplash.com/1200x800/?lisbon,portugal', 'types' => ['historic', 'city_break', 'sea_beach']],
            ['name' => 'Paríž', 'country_iso' => 'FR', 'latitude' => 48.8566, 'longitude' => 2.3522, 'flight_hours_from_vienna' => 2.1, 'description_sk' => 'Klasický mestský výlet s múzeami, architektúrou, parkmi a večernými prechádzkami pri Seine.', 'image_url' => 'https://source.unsplash.com/1200x800/?paris,france', 'types' => ['city_break', 'historic']],
            ['name' => 'Londýn', 'country_iso' => 'GB', 'latitude' => 51.5072, 'longitude' => -0.1276, 'flight_hours_from_vienna' => 2.5, 'description_sk' => 'Veľkomesto s múzeami, divadlami, trhmi, parkmi a ikonickými štvrťami.', 'image_url' => 'https://source.unsplash.com/1200x800/?london,uk', 'types' => ['city_break', 'historic']],
            ['name' => 'Amsterdam', 'country_iso' => 'NL', 'latitude' => 52.3676, 'longitude' => 4.9041, 'flight_hours_from_vienna' => 1.9, 'description_sk' => 'Kanály, bicykle, galérie a kompaktné centrum ideálne na predĺžený víkend.', 'image_url' => 'https://source.unsplash.com/1200x800/?amsterdam,netherlands', 'types' => ['city_break', 'historic']],
            ['name' => 'Berlín', 'country_iso' => 'DE', 'latitude' => 52.5200, 'longitude' => 13.4050, 'flight_hours_from_vienna' => 1.4, 'description_sk' => 'Kreatívna metropola s históriou 20. storočia, múzeami, hudbou a rozmanitými štvrťami.', 'image_url' => 'https://source.unsplash.com/1200x800/?berlin,germany', 'types' => ['city_break', 'historic']],
            ['name' => 'Viedeň', 'country_iso' => 'AT', 'latitude' => 48.2082, 'longitude' => 16.3738, 'flight_hours_from_vienna' => 0.0, 'description_sk' => 'Elegantné mesto s palácmi, múzeami, kaviarňami a výbornou verejnou dopravou.', 'image_url' => 'https://source.unsplash.com/1200x800/?vienna,austria', 'types' => ['city_break', 'historic']],
            ['name' => 'Kodaň', 'country_iso' => 'DK', 'latitude' => 55.6761, 'longitude' => 12.5683, 'flight_hours_from_vienna' => 1.8, 'description_sk' => 'Severské hlavné mesto s prístavom, cyklistikou, dizajnom a štvrťou Nyhavn.', 'image_url' => 'https://source.unsplash.com/1200x800/?copenhagen,denmark', 'types' => ['city_break']],
            ['name' => 'Štokholm', 'country_iso' => 'SE', 'latitude' => 59.3293, 'longitude' => 18.0686, 'flight_hours_from_vienna' => 2.2, 'description_sk' => 'Mesto na ostrovoch s historickým Gamla Stan, múzeami a blízkou prírodou.', 'image_url' => 'https://source.unsplash.com/1200x800/?stockholm,sweden', 'types' => ['city_break', 'historic']],
            ['name' => 'Dublin', 'country_iso' => 'IE', 'latitude' => 53.3498, 'longitude' => -6.2603, 'flight_hours_from_vienna' => 2.8, 'description_sk' => 'Írske hlavné mesto s literárnou históriou, pubmi, parkmi a výletmi na pobrežie.', 'image_url' => 'https://source.unsplash.com/1200x800/?dublin,ireland', 'types' => ['city_break', 'historic']],
            ['name' => 'Marrákeš', 'country_iso' => 'MA', 'latitude' => 31.6295, 'longitude' => -7.9811, 'flight_hours_from_vienna' => 3.8, 'description_sk' => 'Farebné marocké mesto so súkmi, palácmi, záhradami a bránou k Atlasu.', 'image_url' => 'https://source.unsplash.com/1200x800/?marrakech,morocco', 'types' => ['adventure', 'historic', 'city_break']],
            ['name' => 'Petra (Wadi Musa)', 'country_iso' => 'JO', 'latitude' => 30.3285, 'longitude' => 35.4444, 'flight_hours_from_vienna' => 3.6, 'description_sk' => 'Skalné mesto v Jordánsku s dramatickými kaňonmi, chrámami a púštnou krajinou.', 'image_url' => 'https://source.unsplash.com/1200x800/?petra,jordan', 'types' => ['adventure', 'historic']],
            ['name' => 'Madeira (Funchal)', 'country_iso' => 'PT', 'latitude' => 32.6669, 'longitude' => -16.9241, 'flight_hours_from_vienna' => 4.4, 'description_sk' => 'Atlantický ostrov s levádami, útesmi, subtropickou zeleňou a celoročnou turistikou.', 'image_url' => 'https://source.unsplash.com/1200x800/?madeira,funchal', 'types' => ['adventure', 'mountains', 'sea_beach']],
            ['name' => 'Tenerife (Costa Adeje)', 'country_iso' => 'ES', 'latitude' => 28.0866, 'longitude' => -16.7357, 'flight_hours_from_vienna' => 4.8, 'description_sk' => 'Kanársky ostrov s plážami, sopkou Teide a stabilným počasím počas väčšiny roka.', 'image_url' => 'https://source.unsplash.com/1200x800/?tenerife,teide', 'types' => ['adventure', 'mountains', 'sea_beach']],
            ['name' => 'Kapadócia (Goreme)', 'country_iso' => 'TR', 'latitude' => 38.6431, 'longitude' => 34.8289, 'flight_hours_from_vienna' => 3.1, 'description_sk' => 'Rozprávková krajina tufových komínov, údolí a letov balónom nad Goreme.', 'image_url' => 'https://source.unsplash.com/1200x800/?cappadocia,goreme', 'types' => ['adventure', 'historic']],
            ['name' => 'Benátky', 'country_iso' => 'IT', 'latitude' => 45.4408, 'longitude' => 12.3155, 'flight_hours_from_vienna' => 1.1, 'description_sk' => 'Lagúnové mesto s kanálmi, palácmi, ostrovmi a výraznou historickou atmosférou.', 'image_url' => 'https://source.unsplash.com/1200x800/?venice,italy', 'types' => ['historic', 'city_break', 'sea_beach']],
            ['name' => 'Sevilla', 'country_iso' => 'ES', 'latitude' => 37.3891, 'longitude' => -5.9845, 'flight_hours_from_vienna' => 3.1, 'description_sk' => 'Andalúzske mesto s Alcázarom, flamencovou kultúrou a teplými večermi v starom centre.', 'image_url' => 'https://source.unsplash.com/1200x800/?seville,spain', 'types' => ['historic', 'city_break']],
            ['name' => 'Valletta', 'country_iso' => 'MT', 'latitude' => 35.8997, 'longitude' => 14.5146, 'flight_hours_from_vienna' => 2.2, 'description_sk' => 'Maltské hlavné mesto s pevnosťami, prístavmi, kamennými ulicami a blízkymi zátokami.', 'image_url' => 'https://source.unsplash.com/1200x800/?valletta,malta', 'types' => ['historic', 'city_break', 'sea_beach']],
            ['name' => 'Ľubľana', 'country_iso' => 'SI', 'latitude' => 46.0569, 'longitude' => 14.5058, 'flight_hours_from_vienna' => 1.0, 'description_sk' => 'Kompaktné slovinské mesto s hradom, riekou Ljubljanica a rýchlym prístupom k Alpám aj jazerám.', 'image_url' => 'https://source.unsplash.com/1200x800/?ljubljana,slovenia', 'types' => ['city_break', 'historic', 'mountains']],
        ];
    }
}
