import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { FootballService } from "@services/football.service";
import { environment } from "../../../../environments/environment";

@Component({
  selector: "app-team",
  templateUrl: "./team.component.html",
  styleUrls: ["../items.scss"],
})
export class TeamComponent {

  noPhoto = environment.noPhoto;

  constructor(private _route: ActivatedRoute, private _service: FootballService) {
    const id = Number(this._route.snapshot.params["id"]);
    this._service.getTeam(id);
    this._service.getMatchesByTeam(id);
  }

  get store() {
    return this._service.store;
  }

}
