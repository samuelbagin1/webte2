<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;

class ClimateSeeder extends Seeder
{
    public function run(): void
    {
        $exitCode = Artisan::call('climate:fetch');

        if ($exitCode !== 0) {
            $output = trim(Artisan::output());

            throw new \RuntimeException(
                $output === ''
                    ? 'Climate fetch command failed.'
                    : "Climate fetch command failed:\n{$output}",
            );
        }
    }
}
