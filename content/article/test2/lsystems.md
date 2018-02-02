-
-
-

if you still have some doubts regarding the naturally occurring patterns, I suggest have a look at this video by Vi Hart: -video-

When i discovered all these patterns in - -  - - - - - - 

-------

I have always admired patterns [or shapes?] occurring in nature. And many times, these patterns get very intricate, for example this [flower] which has leaves in the form of a fibonacci spiral

------

These patterns make you wonder, why did they form in the first place? is there some higher meaning to this? or is it just a coincidence resulting due to thing A and thing B?

----------

Late one night, while I was deep in a Wikipedia rabbit hole reading about patterns in biology, I found a page describing something called **_L-Systems_**.

Now, finding this page was like I had found a gold mine. Stuff like this get me really excited, when very different complex things come together to form a beautiful system, and L-System is like a perfect mixture of computational geometry, plant biology and algorithms, with a sprinkle of computer graphics in between.

But what is a L-System? 

L-System stands for **Lindenmayer system**, named after a guy called Aristid Lindenmayer.
Aristid was a Hungarian biologist in the 1960s. He tried to create a system which can be used to describe the structure of plants and emulate the growth of algae. Although L-System is a fairly simply system, it can be used to create some very interesting plant-like structures. Here's a sample:

--- viz of 5-6 plants, dark bg, alpha lines, randomize btn ---

These plant structures above were all created through L-Systems. *(You can use the "Re-generate" button to generate [new random plants?] --remove??)*. Even if they appear complex, these plants are actually made using very simple rules. Lets explore this a little more and see how it works:

### Basics of L-System

Using the simplest definition of L-Systems, we can say that it is a **string rewriting system**. what that means is that this system rewrites a string on the basis of some defined rules. It has two main parts:

#### 1. Axiom
The base string that we start the algorithm with is called the **axiom**.

#### 2. Rules
Rules are defined in the form of:
        X -> Y
which translates to "replace X with Y"

A system can have any number of rules, with each rules having a single symbol on its _left_ side, and any length string on its _right_ side.

 The algorithm we use to parse these rules goes something like this:
1. Scan all the symbols in the previous string one by one
2. If a symbol is present in the _left_ side of any defined rule, replace it with the _right_ side of that rule
3. rinse and repeat

This algorithm can be run for any number of iterations. Step through the following animation to see it in action:

--- animation of basic example A->AB , in end, allow changing rules (limited sandbox)---

The principle behind L-Systems is very simple: _In each iteration, rewrite the previous string by applying the defined rules to it_. But where this system starts to get interesting is when the rules become **recursive**. A recursive rule is a rule that replaces a symbol with a copy of itself plus something extra. Now, instead of generating a new random string each iteration, the axiom itself starts to expand and "_grow_". For a example, try using **AB** as the axiom and **B->AB** as the rule in the above animation. You can imagine the string as a rudimentary worm, with **B** representing its head and **A** its body. As the iterations continue, the worm grows.

But still, as fun as it is to imagine a string of letters as a worm, we can go only so far with strings. We need a way to convert these string to actual graphics. For that, we are going to take help of our old pal, **The Turtle from logo**. 

### Turtle Graphics

For those [of you] unfamiliar with this, the **turtle** in the _logo programming language_ represents a simple robot that draws on a 2D plane. How you draw is by controlling the turtle through simple string commands. The 3 main commands we are going to use right now are:

- **F**: Move the turtle forward, wherever it is facing, by `line_length` units
- **+**: Rotate the turtle _anticlockwise_ by `angle`
- **-**: Rotate the turtle _clockwise_ by `angle`

Here `line_length` and `angle` are variables defined before we start the iterations.
A sample command may look like this:
**FFF-FF-F-F+F+FF-F-FFF**

And how the turtle would interpret this command is shown below:

--- animation/gif of turtle with letter highlighting in red, make it interactive ??? ---

By combining turtle graphics with L-Systems, we can start drawing some pretty neat fractal-like forms and cool patterns. Here is one of the classics: 

--- koch snowflake animation/gif with rules ---

This pattern is known as **Koch Snowflake**, designed by Helge von Koch in 1904. Lets go through some more, here is another pattern you might recognize:

--- Sierpinski triangle animation/gif with rules ---

This one's called the **Sierpinski triangle**

--- Dragon curve animation/gif with rules ---

And this is the **Dragon curve**.

If you want to see more examples, I have many more loaded into the sandbox below for you to try out! Feel free to experiment with your own rules and get a feel for how the system works.

--- interactive limited sandbox ---

>Side Note:
>Those of you who are well versed in the knowledge of computer science may have noticed that L-Systems kinda look a lot like [formal grammar](), and you would be correct. Although technically speaking, L-Systems are a strict _subset_ of [languages](), because here all the [production rules]() are applied at once instead of applying one rule per iteration.
>
> But alas, even after spending an entire semester trying to learn this stuff I still don't fully understand it. If you wish to explore this further, I recommend starting [here]().

With that side note aside, lets get back on track. By now, you might have a pretty good grasp on how this system works. You might even have tried to come up with your own patterns. So here is a mid blog quiz for you. (Surprise !!)

--- pic of first 3-5 iterations of a simple binary tree ---

See the pattern above. Its a simple representation of a binary tree. I want you to take 5 minutes and think of a rule (or multiple rules) that can generate the above pattern. You can use the sandbox above to try out your solutions to see if they work.

Go on, try it! I'll wait...

.
.
.
.

**Answer :**
tl;dr: There is no answer (Sorry, trick question :P)

Unless you came up with a brilliant solution that I couldn't think of(tweet it to me if you have), or if you designed a overly complex system using overlapping lines or something (tweet this one to me too if you actually made it :)), you might have noticed: It doesn't work!

If you use a pen to draw this tree, you would have to _lift the pen and move it to a previous point in the pattern to continue drawing_. There is no way to draw it in a single stroke like we were doing till now with our fractal patterns. At this point, our current collection of turtle commands is inadequate, and we need to expand our system.

## Turtle Graphics 2.0

I am going to introduce two new commands:

- **[**: Store the current position and angle of the turtle to `stack`
- **]**: Retrieve a position and angle from the top of the `stack` and move the turtle there

The `stck` here refers to a standard LIFO( **L**ast **I**n **F**irst **O**ut) stack data structure found in computer science. Simple explanation: stuff goes in from the top of the stack when a _push_( '[' ) operation is done, and the thing present at the top of the stack is retrieved when a _pop_ ( ']' ) operation is executed.

So, the actual answer for the quiz above is the following L-System:
**Axiom:** B
**Rules:** A->AA and B->A[+B]-B (maybe convert this to F only)
**Angle:** 45 degree

_here A and B both work exactly the same as F_

The first three iterations for this produce:
A[+B]-B
AA[+A[+B]-B]-A[+B]-B
AAAA[+AA[+A[+B]-B]-A[+B]-B]-AA[+A[+B]-B]-A[+B]-B

How this string would actually be interpreted by the turtle to draw the above tree is shown in the following animation:

--- binary tree explanation animation/gif, highlight letter in red ---

and here is the full tree:

--- animation/gif of binary tree with rules ---


 - - - - - - - - -     not sure of further content  - - - - - - - - - - - 


Now that we have unlock the ability to create **branching structures**, the door is wide open to all kinds of plant structures. Using only these five commands, we can create each of the plant shown in the initial example at the starting of this article, and many more!

##Lets get random

At this point in my research, I still had one question nagging me, "What is the use of creating this system?" It turns out, L-Systems are actually really useful. They are used to study the behaviour of plant cells, to emulate the growth processes of plant development and have also been used to model the morphology of a variety of organisms. They can be used to generate self-similar fractals as we have already seen, and are also used extensively to generate artificial plants and trees in games.

Yeah, games. 




We can even start creating more realistic versions of these plants simply by giving special meaning to the different symbols used. For example




There are a bunch of sample plants loaded in the new sandbox below, try them out and experiment with creating your own plants! You can also use any of the samples as a starting point and start modifying from there if you want to.

--- new sandbox with stack, loaded plants ---


and L-Systems dont stop here, you can keep introduciing new symbols, shift it to 3D instead of 2D and even start to write rules for individual leaves and flowers. For a preview, here is a really cool system i found in [that book] that makes suprisingly realistic plants - 

--- screenshot/gif of some cool as fuck lsystem ---

If you are interested in learning this system more in depth, i highly recomend [that book]. And with that, we have reached the end of this long blog. Thanks for reading it all the way!




So finally we have reached the end of this long blog, and have learnt about L-Systems. What you might not know is that L-Systems are used extensively 






### Conclusion
Well, there is not much left to conclude so i will use this section as a immpromtu credits section (yay!)

This article, and all of the included animations and interactive stuff was created by Arsh[(thats me!)](). If you want to know more about how i built all the animations(its basically python + D3) you can check out the [behind the scenes blog]. I was heavily inspired by the work of [ncase], [curator guy] and all the articles present on the awesome site [explorabl.es] to make this interactive. the book [algorithmic beauty of plants] was really helpful, along with all the links included in the _further reading_ section below. 

As this is my first attempt at writing this kind of stuff, I would appreciate if you could give me some feedback so that the upcoming articles are even better!
You can tweet your thoughts to me at [@oddanomaly]



