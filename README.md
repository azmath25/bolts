Need a framework that I can locally host in GitHub for me
with JS, CSS, and HTML only

screen n times m grid, n and m adjustable between 5 and 20 each

One can choose some lattice points in an order, and the program should auto-connect the newly chosen point with the previous

a point is  only allowed to be chosen as next if two consecutive edges make 90 degrees or 270 degrees
If it comes back to the start point, then it is closed, and no more choices are allowed.


The user can also mark some cells in the grid at the beginning to form the domain.

Later user is allowed to assign a sign(+ or -) to one of the vertices of the broken line, then all other points should be marked with a sign, such that signs alternate while moving on the broken line


Now I describe the moves:

1) A  vertical edge can be moved to the left or right if, at the end of this movement, its endpoints stay inside the pre-chosen domain (while this edge moves, the two points are moving and all connected edges shorten or become larger, no connection is lost)
2)  A horizontal  edge can be moved up or down if, at the end of this movement, its endpoints stay inside the pre-chosen domain 
3) If there is a rectangle with all corners
(a,b), (a,d), (c,b), (c,d) inside the pre-chosen domain
such that a<c and b<d
then 
3.1.  If (a,b) and (c,d) are both negatively signed, then one can choose them both and, with one click, can move (a,b) to (a,d) and (c,d) to (c,b)
3.2.  If (a,d) and (c,b) are both positively signed, then one can choose them both and, with one click, can move (a,d) to (a,b) and (c,b) to (c,d)


Thus, on top we need  choose the domain button
draw bolt(broken line) button
Adjust the grid thing




