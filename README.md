

## SVG Create

```
apt-get update && apt-get install -y potrace imagemagick 2>&1 | tail -5
convert jpc-initials2-tight.png -colorspace Gray -threshold 50% jpc-initials2-tight.pbm
potrace jpc-initials2-tight.pbm -s -a 1 -t 5 -o jpc-initials-tight.svg
```
