import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import { PlayersMovements } from './tic-tac-toe.model';

interface BasicEntity {
  id: string;
}

export interface GameState extends BasicEntity {
  data: PlayersMovements;
}

@Injectable({
  providedIn: 'root',
})
export class TicTacToeService {
  constructor(private firestore: AngularFirestore) {}

  newGame(movement: PlayersMovements = new PlayersMovements()) {
    return from(
      this.firestore.collection('Game State').add({ ...movement })
    ).pipe(
      map(x => ({
        id: x.id,
        data: movement
      } as GameState))
    );
  }

  getGameState(id: string) {
    return this.firestore
      .collection('Game State')
      .doc(id)
      .snapshotChanges()
      .pipe(
        map(x => ({
          id: x.payload.id,
          data: x.payload.data(),
        } as GameState))
      );
  }

  updateGameState(id: string, movement: PlayersMovements) {
    this.firestore.doc('Game State/' + id).update({ ...movement });
  }

  // delete_Icecream(record_id) {
  //   this.firestore.doc('Game State/' + record_id).delete();
  // }
}
