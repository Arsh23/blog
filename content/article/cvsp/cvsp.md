---
title: "Concurrency VS Parallelism"
date: 2018-01-31
draft: true
---

Recently, I have been experimenting with web scraping a lot, and after one too many session of just sitting around waiting for my requests to finish, I finally decided to see if there exists a better way. After some initial Googling I found out about two techniques known as **parallelism** and **concurrency**, and thus began my journey into learning about these two for the next few months. During that time, I noticed that several people, me included, were confused on whats the difference between these two? So this article is my attempt at explaining how these two work and what is the difference between them.

But before we start thinking about what these actually are, lets start with an example of both in action.

## An example

Lets start with a pretty standard function `fib()` to calculate the nth fibonacci number.
`fib()` will act as our substitute for some arbitrary complex time consuming computation.
Here is a simple (and *bad*) implementation of `fib()` written in python:

```python
def fib(x):
    if x == 0 or x == 1:
        return 1
    return fib(x-1) + fib(x-2)
```

Now lets calculate the 30th fibonacci number 50 times, cause why not? :)

```python
for x in range(50):
    fib(30)
```

And here's the output:

```
➔ python fib.py
Time for synchronous fib(): 28.140856742858887 seconds
```
code used to produce this output can be found here

Executing the above for loop took **~30** seconds, with each call to the `fib()` function taking **y** seconds on average. Lets take this as the baseline and see what happens if we made the code parallel or concurrent:

```
➔ python fib.py
Time for synchronous fib(): 27.763985633850098 seconds
Time for asynchronous fib(): 64.95514941215515 seconds
Time for parallel(threads) fib(): 32.95688080787659 seconds
Time for parallel(processes) fib(): 18.218430519104004 seconds
```
code used to produce this output can be found here -

_Huh ?_

As some of you may have guessed, and others might be surprised to see, implementing threads or coroutines to speed up the computation has no effect. It even *takes more time* than the original in case of xyz. Only processes seems to offer marginal advantage. This example may make it look like there's no advantage in using coroutines or threads, but I intentionally chose this example first to show that not everything gets magically sped up if implemented using parallel/concurrent code.

To spice things up a little but, lets try downloading 50 webpages instead of calculating `fib(30)` 50 times. What would happen then?

```
➔ python download.py
Time for synchronous fib(): 15.663839101791382 seconds
Time for asynchronous fib(): 1.398474931716919 seconds
Time for parallel(threads) fib(): 1.8830058574676514 seconds
Time for parallel(processes) fib(): 4.917798280715942 seconds
```
code used to produce this output can be found here -

In this case, threads and especially coroutines far outperform synchronous code. processes, although still much faster than synchronous, are lagging behind. Here too each individual call to the function still takes x seconds on average, just like the previous example, but the result is vastly different. Why is there such a big difference between the performance of the two examples? How do these things actually work? Lets find out!


## How Parallelism and Concurrency work

In this section, I will try my best to explain the concepts behind parallelism and concurrency by trying to visualize how both work. For the purpose of this demonstration, imagine that you work at a new upcoming startup. You have been given the task of coming up with a algorithm to load a image when given a list of pixels. To process a single pixel, you have to go through these two steps:

[anim of loading on repeat]
Firstly, you have to ***load*** the pixel's data. This can represent loading the pixel from memory, sending a http request for the pixel's data or any number of other things. But what this step mainly depicts is something that takes a long time(relative to rest of the code) to process while the code is waiting for it to finish before continuing.

[anim of rendering on repeat]
Once a pixel is loaded, you have to ***render*** it so that it can be displayed on the screen. This step depicts something that is computationally complex and requires CPU power to complete.

Lets see what different approaches we can take with a 4x4 sized image:

### 1. Synchronous Code

One of the ways we can build this algorithm is by simply using a loop. While there are pixels in the list, extract one, load it, render it and repeat. This algorithm is easy to understand and simple to code, but how well does it perform?

[anim 4x4 sync]

Well... It works and gets the job done, but its *glacially slow*. The main reason it takes so long to complete is that while its loading a pixel, the code is just sitting there doing nothing. Lets try speeding things up a little bit.

### 2. Parallel code

When writing parallel code, two major approaches exist: *multiprocessing* and *multithreading*. But for the purpose of our demonstration we can assume that these two are mostly the same. In a broad sense, **threads** or **processes** are a parts of the main program that can run independent from the main program. At any moment there can be multiple threads or processes running along, or *parallel to*, the main program. You can imagine threads or processes as small mini programs that branch out from your main program, and your operating system runs them alongside your main program, your music player, Google chrome and other stuff running in background. 

To load our image, lets say we creates a thread for each pixel, and then inside each thread we load and render that pixel. It would execute something like this:

[anim 4x4 parallel ideal]

Thats a whole lot faster than our synchronous code! If you notice in the animation, we are not reducing the time it takes to load a pixel. Each thread still takes just as long as before, but by running all the threads at once we can finish the work in significantly less time.

So, threads can make your code run a lot faster, why not use them everywhere? Because to use multithreading efficiently the code should have parts that can work *independently* from each other. As an example, if we take the fibonacci function from earlier and try to put each of its recursive call in a separate thread, it would still be just as slow, as each step depends on the previous step's results and cant run until the previous has finished running, essentially making it run synchronously.

Another thing to consider is that your language of choice may not have support for threads, or you might be limited to using only one thread for some reason. In situations like these, the concurrent way of coding really comes in handy:

### 3. Concurrent Code

Once you start to dive into concurrency, you will start to see strange objects named 'futures' or 'promises', and people start talking about things like 'defering' a task or the infamous 'callback hell'. To keep things simple, we are going to use a very basic model of comprising of *coroutines*, which are generally used with the `async` and `await` keywords.

A **coroutine** is just like a normal function but with a special ability, that it can suspend its execution at any time and then resume from that point sometime later on. This ability turns out to be really helpful in a lot of situations. For example, lets say you want to download a page, the coroutine that sent the HTTP request for the page can just suspend as soon as it sends the request. Then you can run some other functions while you wait for the page to download, and resume the coroutine once the page is downloaded so it can do its work on the downloaded page.

This time to load our image, we can create a coroutine for each pixel. While a coroutine is waiting for its pixel to load, it can suspend and let other coroutines load or render pixels. When the pixel is loaded, the coroutine can be resumed again and it can render the loaded pixel. Lets see how this performs:

[anim 4x4 coroutine ideal]

Its still significantly faster than the synchronous code, but is slower than parallel code. The key difference between this and parallelism is that no two coroutines can run at the same time. While loading pixels, each coroutine is suspended and waiting for it's pixel to load, so all the pixels can be loaded at the same time. But while a coroutine is rendering it's pixel, all other coroutines are suspended and only a single pixel can be rendered at a time. This happens because all coroutines essentially run on a single thread, so the suspended coroutines have to wait for the currently active coroutine to either suspend, or finish its work so that they can get a chance to run.

This is the reason why while writing a concurrent program, all the functions *must* be coroutines. Even if one of the functions is not a coroutine, it can block the main thread while its running and you wont be able to take full advantage of concurrency. 

And as for the same question we asked in multithreading, Why not use coroutines everywhere? Because,
- Not all programs have parts that have to wait for external things to finish, which makes suspending a function useless
- Most of the major libraries are not built using coroutines, which doesn't help much with the "all functions *must* be coroutines" thing

And now for the side by side comparison you all have been waiting for:

[anim all 3 4x4 ideal]


## Ideal world VS Real world

Although all the animations above were accurate portrayal of both techniques, they were slightly misleading, as they exist in the ideal world. This is similar to those high school physics problems where we assumed things like air resistance and curvature of earth didn't exist, because it lets us focus on the main principles rather then get bogged down in too many details.

But in a real world, we cant make thousands of threads, one per each task. Each thread requires its own overhead and memory, and extra stuff that the OS needs to handle in order to execute a thread, and no OS can handle that many threads. Even if you can get a large number of threads to run, there would be no use because most commercially available CPU have fewer than 16 cores, and only a dozen or two thread can run truly parallel to each other. [correct?]

In the case of coroutines, they are just functions so we can easily create thousands of them for each task. But this is also not desirable in many situations, like when you try to send a lot of HTTP requests to the same server. Sending a huge amount of concurrent requests to a single server will likely result in either acting as a DDoS attack and harming the server or a ban of your IP from their servers for a arbitrary time period.

## Which technique should I use then?

- in practice
- to counter these real world limitations , we use pool [explain]
- we use pools and locks, semaphores to limit the no of consecutive threads/coroutines

To make our animations depict a slightly better representation of the real world, we will limit the maximum number of coroutines and thread we can run to 8. Now lets look at a few different situation to see where each technique shines:

- If your work involves mostly **I/O bound** tasks, like if our image only required loading, then coroutines are just as fast as thread. Coroutines are even preferred over threads because they don't require any additional overhead, run in a single thread and you can easily create thousands of them.
		-so thats why in above example ..... 
- If your work involves mostly **CPU bound** tasks, which can be represented by our image only needing rendering, then threads far outperform coroutines. This is obvious as coroutines can only run one at a time and would take the same time as synchronous code. Here, suspending a coroutine wont give us any advantage.
- Or maybe if your work is a mix of both **I/O and CPU bound**, then deciding which one is better will depend on the specifics of your program. If you observe the animation below, you will see that coroutines are far more comparable to threads in performance when real world limits are applied as compared to the ideal case animations.

And lastly, most applications work just fine with synchronous code! Unless your code is getting too slow, you don't need to parallelize your code or convert everything to coroutines. Even if it gets slow, you should probably look first into refactoring or profiling your code before trying these techniques. That said, if your problem comes under whats known as [embarrassingly parallel](https://en.wikipedia.org/wiki/Embarrassingly_parallel) problems, then you should definitely look at parallelization first :D

And now just for fun, lets also checkout both techniques on a 16x16 image with max 32 threads/coroutines:

[anim]

## A caveat: multithreading in python

If you have never worked in python or never plan to, this section might not be relevant for you. But I use python as one of my main languages, So I wanted to explain this briefly here.

- here difference between multiprocessing and multithreading actually matter

Multithreading in python is a tricky business. As almost everyone knows, there exists a thing called **G**lobal **I**nterpreter **L**ock (or GIL) in CPython, the reference implementation of python. Basically GIL is a global lock that prevents threads from running in more than one core, severely limiting the potential of threads and it exists because Cpython's memory management is not thread-safe.

Threads in python still work great for most stuff thats I/O bound, but if GIL is acting as a bottleneck you can still work around it. [one option is] by using the `multiprocessing` library and using separate processes instead of threads, as each process will have its own GIL and can run parallel to other processes [dont mind a little additional overhead]. You can also use other implementations of python that don't have GIL like Jython or IronPython.

If you want to learn more about this in detail, I would highly recommend [David Beazley's talk](https://www.youtube.com/watch?v=ph374fJqFPE) on the topic.

## Conclusion

In conclusion, both parallelism and concurrency are very powerful techniques that can greatly reduce the runtime of your programs, but both have their own very specific areas where they can be used efficiently. Hopefully after reading this article you have a better understanding of how parallelism and concurrency work.

I would highly appreciate any feedback, suggestions or criticism you might have regarding this article. Feel free to message me on twitter at @oddanomaly or @[blogname] or leave a comment below.

The code for all the examples and animations used in this article is open source and can be found here: [github link]

Further reading:



Images used:

