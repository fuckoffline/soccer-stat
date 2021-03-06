import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FootballService } from "@services/football.service";
import { Match, Score } from "@models";
import { Subscription } from "rxjs";
import { DatePipe } from "@angular/common";
import { ActivatedRoute, Params, Router } from "@angular/router";

@Component({
  selector: "matches-data",
  templateUrl: "./matches.component.html",
  styleUrls: ["../tables.scss", "./matches.component.scss"],
})
export class MatchesComponent implements OnInit, OnDestroy {
  @Input() matches: Match[] = [];
  @Input() id: number = 0;
  @Input() type: "team" | "competition" = "competition";
  displayedColumns: string[] = ["status", "stage", "date", "score", "attachment"];
  sub?: Subscription;
  dateTo?: Date;
  dateFrom?: Date;

  @ViewChild("startDate") startDate?: ElementRef<HTMLInputElement>;
  @ViewChild("startDate") endDate?: ElementRef<HTMLInputElement>;

  constructor(private _service: FootballService, private _route: ActivatedRoute, private _router: Router) {
  }

  clearFilter() {
    (document.querySelector(".endDate") as any).value = "";
    (document.querySelector(".startDate") as any).value = "";
    this._router.navigate(
      [],
      {
        relativeTo: this._route,
        queryParams: {},
        queryParamsHandling: "",
      }).then();
    if (this.type === 'competition') this._service.getMatchesByCompetition(this.id);
    else this._service.getMatchesByTeam(this.id);
  }

  filteredDateTo(e: any) {
    if (this.dateFrom && this.dateFrom > new Date(e.value)) {
      e.value = this.dateTo?.toUTCString();
      return;
    }
    this.filtered(e, "dateTo");
  }

  filteredDateFrom(e: any) {
    if (this.dateTo && this.dateTo < new Date(e.value)) {
      e.value = this.dateFrom?.toUTCString();
      return;
    }
    this.filtered(e, "dateFrom");
  }

  filtered(e: any, dateKEY: string) {
    (this as any)["dateKEY"] = new Date(e.value);
    const datePipe: DatePipe = new DatePipe("en-US");
    const date = datePipe.transform(e.value, "YYYY-MM-dd");
    const queryParams: Params = { ...this._route.snapshot.queryParams, [dateKEY]: date };
    this._router.navigate(
      [],
      {
        relativeTo: this._route,
        queryParams: queryParams,
        queryParamsHandling: "merge",
      }).then();
  }

  ngOnInit() {
    this.sub = this._route.queryParams.subscribe(queryParams => {
      const e = queryParams as any;
      const options: any = {};
      if (!this.id || this.id === 0) return;
      if (!e.dateFrom || !e.dateTo) return;
      this.dateTo = new Date(e.dateTo);
      this.dateFrom = new Date(e.dateFrom);
      options["dateFrom"] = [e.dateFrom, "GET"];
      options["dateTo"] = [e.dateTo, "GET"];
      if (this.type === 'competition') this._service.getMatchesByCompetition(this.id, options);
      else this._service.getMatchesByTeam(this.id, options);
    });
  }

  score(score: Score) {
    const output = { homeTeam: 0, awayTeam: 0 };
    if (score) {
      Object.keys(output).forEach(k => {
        ["extraTime", "fullTime", "halfTime", "penalties"].forEach(key => {
          if ((score as any)[key][k]) (output as any)[k] = (output as any)[k] + (score as any)[key][k];
        });
      });
    }
    return output;
  }

  attachment(match: Match) {
    const away = match.awayTeam.id;
    const home = match.homeTeam.id;
    if (match && away && home) {
      if (away === this.id) return "Away";
      return "Home";
    }
    return "Not yet info";
  }

  status(match: Match): any {
    if (this.type === "team") {
      if (new Date(match.utcDate) > new Date()) return "Not yet info";
      if (!match.score.winner) return "Tie";
      if (match.score.winner === "HOME_TEAM" && this.attachment(match) === "Home") return "Win";
      if (match.score.winner === "AWAY_TEAM" && this.attachment(match) === "Away") return "Win";
      return "Lose";
    } else {
      if (!match.score.winner) return { name: "Not yet info", id: null };
      if (match.score.winner === "HOME_TEAM") return match.homeTeam;
      else return match.awayTeam;
    }
  }

  anotherTeam(match: Match) {
    if (!match.score.winner) return { name: "Not yet info", id: null };
    if (match.score.winner === "HOME_TEAM") return match.awayTeam;
    else return match.homeTeam;
  }

  ngOnDestroy() {
    this.sub!.unsubscribe();
  }
}
