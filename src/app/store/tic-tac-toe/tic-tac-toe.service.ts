import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as _ from 'lodash';
import { BehaviorSubject, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { GameState, getMyPlayer } from './tic-tac-toe.model';

@Injectable({
  providedIn: 'root',
})
export class TicTacToeService {
  constructor(private firestore: AngularFirestore) {}

  readonly userId$ = new BehaviorSubject<string>(null);

  newGame(gameState: GameState = new GameState(this.userId$.value)) {
    return from(
      this.firestore.collection('Game State').add({ ...gameState })
    ).pipe(
      map(x => {
        gameState.id = x.id;
        return gameState;
      })
    );
  }

  getGameState(id: string) {
    return this.firestore
      .collection('Game State')
      .doc(id)
      .snapshotChanges()
      .pipe(
        map(x => {
          const data = x.payload.data() as GameState;
          const state = ({
            ...data,
            id: data ? x.payload.id : null,
          } as GameState);

          const userId = this.userId$.value;
          const thereIsRoom = _.some(state.playersId, pId => !pId);
          const playerIsNotInMatch = !_.some(state.playersId, pId => pId === userId);
          if (thereIsRoom && playerIsNotInMatch) {
            state.playersId[getMyPlayer(userId, state.playersId)] = userId;
            this.updateGameState(id, state);
          } else if (!thereIsRoom && playerIsNotInMatch) {
            return null;
          }

          return state;
        }),
      );
  }

  updateGameState(id: string, gameState: GameState) {
    this.firestore.doc('Game State/' + id).update({ ...gameState });
  }
}
