"use client";

import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
} from "@microsoft/signalr";
import { useLocalObservable } from "mobx-react-lite";
import { useEffect, useRef } from "react";
import { Bid } from "../models/Bid";
import { runInAction } from "mobx";

export const useBids = (auctionId: string) => {
  const created = useRef(false);
  const bidStore = useLocalObservable(() => ({
    bids: [] as Bid[],
    hubConnection: null as HubConnection | null,
    createHubConnection(auctionId: string) {
      if (!auctionId) return;
      this.hubConnection = new HubConnectionBuilder()
        .withUrl(`${process.env.NEXT_PUBLIC_BIDS_URL}?auctionId=${auctionId}`, {
          withCredentials: true,
        })
        .withAutomaticReconnect()
        .build();

      this.hubConnection
        .start()
        .catch((error) =>
          console.log("Error establishing connection: ", error)
        );
      this.hubConnection.on("LoadBids", (bids) => {
        runInAction(() => {
          this.bids = bids;
        });
      });
      this.hubConnection.on("ReceiveBid", (bid) => {
        runInAction(() => {
          this.bids.unshift(bid);
        });
      });
    },

    stopHubConnection() {
      if (this.hubConnection?.state === HubConnectionState.Connected) {
        this.hubConnection
          .stop()
          .catch((error) => console.log("Error stopping connection: ", error));
      }
    },
  }));

  useEffect(() => {
    if (auctionId && !created.current) {
      bidStore.createHubConnection(auctionId);
      created.current = true;
    }
    return () => {
      bidStore.stopHubConnection();
      bidStore.bids = [];
    };
  }, [auctionId, bidStore]);
  return { bidStore };
};
