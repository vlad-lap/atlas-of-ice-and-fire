import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LocationData } from '../../models';

@Component({
    selector: 'cc-map-tooltip',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: 'map-tooltip.component.html',
    styleUrl: './map-tooltip.component.scss',
})
export class MapTooltipComponent {
    location = input.required<LocationData>();
}
