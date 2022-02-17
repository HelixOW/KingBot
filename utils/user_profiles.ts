import { Collection } from "discord.js"
import { Unit, GameUnitData } from './units';

export interface DemonTeam {
    red: Unit[],
    grey: Unit[],
    crimson: Unit[],
    bellmoth: Unit[]
}

export class UserProfile {
    private _drawnSSRs: number;
    public get drawnSSRs(): number {
        return this._drawnSSRs;
    }
    public set drawnSSRs(value: number) {
        this._drawnSSRs = value;
    }

    private _drawnTotal: number;
    public get drawnTotal(): number {
        return this._drawnTotal;
    }
    public set drawnTotal(value: number) {
        this._drawnTotal = value;
    }

    private _spendGems: number;
    public get spendGems(): number {
        return this._spendGems;
    }
    public set spendGems(value: number) {
        this._spendGems = value;
    }

    private _multis: number;
    public get multis(): number {
        return this._multis;
    }
    public set multis(value: number) {
        this._multis = value;
    }

    private _singles: number;
    public get singles(): number {
        return this._singles;
    }
    public set singles(value: number) {
        this._singles = value;
    }

    private _gameUnits: Collection<string, GameUnitData>;
    public get gameUnits(): Collection<string, GameUnitData> {
        return this._gameUnits;
    }
    public set gameUnits(value: Collection<string, GameUnitData>) {
        this._gameUnits = value;
    }

    private _demonTeams: DemonTeam;
    public get demonTeams(): DemonTeam {
        return this._demonTeams;
    }
    public set demonTeams(value: DemonTeam) {
        this._demonTeams = value;
    }

    private _birdTeam: Unit[];
    public get birdTeam(): Unit[] {
        return this._birdTeam;
    }
    public set birdTeam(value: Unit[]) {
        this._birdTeam = value;
    }

    public constructor(drawnSSRs: number, drawnTotal: number, multis: number, singles: number, gameUnits: Collection<string, GameUnitData>, demonTeams: DemonTeam, birdTeam: Unit[]) {
        this.drawnSSRs = drawnSSRs
        this.drawnTotal = drawnTotal
        this.multis = multis
        this.singles = singles
        this.gameUnits = gameUnits
        this.demonTeams = demonTeams
        this.birdTeam = birdTeam
        
        this.spendGems = (30 * multis) + (3 * singles)
    }
}