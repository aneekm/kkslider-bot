import { Button } from "../types";
import { playpause } from "./playpause";
import { shuffle } from "./shuffle";
import { skip } from "./skip";
import { stop } from "./stop";

export const buttons: Map<string, Button> = new Map(
    // Add new buttons here
    [playpause, shuffle, skip, stop]
        .map(button => [button.name, button])
);
