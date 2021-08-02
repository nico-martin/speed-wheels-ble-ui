import {
  GestureDescription,
  Finger,
  FingerCurl,
  FingerDirection,
} from 'fingerpose';

const description = new GestureDescription('back');

// thumb:
description.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 0.5);
description.addCurl(Finger.Thumb, FingerCurl.FullCurl, 0.5);

// index:
description.addCurl(Finger.Index, FingerCurl.NoCurl, 1.0);
description.addDirection(Finger.Index, FingerDirection.VerticalUp, 0.75);
description.addDirection(Finger.Index, FingerDirection.DiagonalUpLeft, 1.0);

// middle:
description.addCurl(Finger.Middle, FingerCurl.HalfCurl, 0.5);
description.addCurl(Finger.Middle, FingerCurl.FullCurl, 0.5);

// ring:
description.addCurl(Finger.Ring, FingerCurl.HalfCurl, 0.5);
description.addCurl(Finger.Ring, FingerCurl.FullCurl, 0.5);

// pinky:
description.addCurl(Finger.Pinky, FingerCurl.NoCurl, 1.0);
description.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 1.0);
description.addDirection(Finger.Pinky, FingerDirection.DiagonalUpLeft, 0.75);

// give additional weight to index and ring fingers
//description.setWeight(Finger.Index, 2);
//description.setWeight(Finger.Middle, 2);

export default description;
