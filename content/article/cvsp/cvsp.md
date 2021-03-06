---
title: "Concurrency vs Parallelism"
date: "2018-02-08"
description: An attempt to visually explain the difference between concurrency and parallelism
url: /cvsp/
includeD3: true
customJS: ['js/cvsp/noframework.waypoints.min.js', 'js/cvsp/animations.js']
customCSS: ['css/cvsp/animations.css']
footer: false
categories: ['core cs']
tags: ['concurrency', 'parallelism']
images: ["../imgs/cvsp/img.png"]
authors: ["arsh"]
---

Recently, I have been experimenting with web scraping a lot, and after one too many session of just sitting around waiting for my requests to finish, I finally decided to see if there exists a better way. After some initial Googling I found out about two techniques known as **parallelism** and **concurrency**, and thus began my journey into learning about these two for the next few months. During that time, I noticed that several people, including me, were confused on what the difference between these two? So this article is my attempt at explaining how these two work and what is the difference between them.

But before we start thinking about what these actually are, let's start with an example of both in action.

## An example

Lets start with a pretty standard function `fib()` to calculate the nth fibonacci number.
`fib()` will act as our substitute for some arbitrary complex time consuming computation.
Here is a simple (and *bad* ) implementation of `fib()` written in python:

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

Executing the above for loop took **~30** seconds, with each call to the `fib()` function taking 0.5 seconds on average. Let's take this as the baseline and see what happens if we made the code parallel or concurrent:

```
➔ python fib.py
Time for synchronous fib(): 27.763985633850098 seconds
Time for asynchronous fib(): 64.95514941215515 seconds
Time for parallel(threads) fib(): 32.95688080787659 seconds
Time for parallel(processes) fib(): 18.218430519104004 seconds
```
{{% center %}}{{% text s="0.8" color="#808080" %}}
*The code used to produce this output can be found [here](https://github.com/Arsh23/cvsp/blob/master/fib.py)*
{{% /text %}}{{% /center %}}

_Huh?_

As some of you may have guessed, and others might be surprised to see, implementing threads or coroutines to speed up the computation has no effect. It even *takes more time* than the original in case of coroutines and threads. Only processes seem to offer a marginal advantage. This example may make it look like there's no advantage in using coroutines or threads, but I intentionally chose this example first to show that not everything gets magically sped up if implemented using parallel/concurrent code.

To spice things up a little bit, let's try downloading 50 web pages instead of calculating `fib(30)` 50 times. What would happen then?

```
➔ python download.py
Time for synchronous fib(): 15.663839101791382 seconds
Time for asynchronous fib(): 1.398474931716919 seconds
Time for parallel(threads) fib(): 1.8830058574676514 seconds
Time for parallel(processes) fib(): 4.917798280715942 seconds
```
{{% center %}}{{% text s="0.8" color="#808080" %}}
*The code used to produce this output can be found [here](https://github.com/Arsh23/cvsp/blob/master/download.py)*
{{% /text %}}{{% /center %}}

 
In this case, threads and especially coroutines far outperform synchronous code. processes, although still much faster than synchronous, are lagging behind. Here too each individual call to the function still takes 0.5 seconds on average, just like the previous example, but the result is vastly different. Why is there such a big difference between the performance of the two examples? How do these things actually work? Let's find out!


## How Parallelism and Concurrency work

In this section, I will try my best to explain the concepts behind parallelism and concurrency by trying to visualize how both work. For the purpose of this demonstration, imagine that you work at a new upcoming startup. You have been given the task of coming up with an algorithm to load an image when given a list of pixels. To process a single pixel, you have to go through these two steps:

<div id='single-pixel-load'></div>
{{% inline-block 60 %}}Firstly, you have to **load** the pixel's data. This can represent loading the pixel from memory, sending an HTTP request for the pixel's data or any number of other things. But what this step mainly depicts is something that takes a long time(relative to rest of the code) to process while the code is waiting for it to finish before continuing.{{% /inline-block %}}

<div id='single-pixel-render'></div>
{{% inline-block 60 %}}Once a pixel is loaded, you have to **render** it so that it can be displayed on the screen. This step depicts something that is computationally complex and requires CPU power to complete. Actual pixels don't work like this but this representation will make our demo easier to understand.{{% /inline-block %}}

The time it takes for both of these to finish will be randomly selected between a range, as the runtime for real-life tasks is always slightly different each time. Note that actual pixels in a display don't work like this, this is just a analogy I use to make the explanation a little easier. Let's see what different approaches we can take with a 4x4 sized image:

### 1. Synchronous Code

One of the ways we can build this algorithm is by simply using a loop. While there are pixels in the list, extract one, load it, render it and repeat. This algorithm is easy to understand and simple to code, but how well does it perform?

<div id='sync-ideal'></div>
{{% center %}}{{% text s="0.9" color="#808080" %}}
*Synchronous loading of image*
{{% /text %}}{{% /center %}}
Well... It works and gets the job done, but it's *glacially slow*. The main reason it takes so long to complete is that while it's loading a pixel, the code is just sitting there doing nothing. Let's try speeding things up a little bit.

### 2. Parallel code

When writing parallel code, two major approaches exist, *multiprocessing* and *multithreading*. But for the purpose of our demonstration, we can assume that these two are mostly the same. In a broad sense, **threads** or **processes** are parts of the main program that can run independently from the main program. At any moment there can be multiple threads or processes running along, or *parallel to*, the main program.

To load our image, let's say we create a thread for each pixel, and then inside each thread, we load and render that pixel. It would execute something like this:
 
<div id='parallel-ideal'></div>
{{% center %}}{{% text s="0.9" color="#808080" %}}
*Parallel loading of image*
{{% /text %}}{{% /center %}}
That's a whole lot faster than our synchronous code! If you notice in the animation, we are not reducing the time it takes to load a pixel. Each pixel still takes just as long as before, but by processing all the pixels at once we can finish the work in significantly less time.

So, threads can make your code run a lot faster, why not use them everywhere? Because to use multithreading efficiently the code should have parts that can work *independently* from each other. As an example, if we take the Fibonacci function from earlier and try to put each of its recursive call in a separate thread, it would still be just as slow, as each step depends on the previous step's results and cant run until the previous has finished running, essentially making it run synchronously.

Another thing to consider is that your language of choice may not have support for threads, or you might be limited to using only one thread for some reason. In situations like these, the concurrent way of coding really comes in handy:

### 3. Concurrent Code

Once you start to dive into concurrency, you will start to see strange objects named "futures" or "promises", and people start talking about things like "deferring" a task or the infamous "callback hell". To keep things simple, we are going to use a very basic model of comprising of *coroutines*, which are generally used with the `async` and `await` keywords.

A **coroutine** is just like a normal function but with a special ability, that it can suspend its execution at any time and then resume from that point sometime later on. This ability turns out to be really helpful in a lot of situations. For example, let's say you want to download a page, the coroutine that sent the HTTP request for the page can just suspend as soon as it sends the request. Then you can run some other functions while you wait for the page to download, and resume the coroutine once the page is downloaded so it can do its work on the downloaded page.

This time to load our image, we can create a coroutine for each pixel. While a coroutine is waiting for its pixel to load, it can suspend and let other coroutines load or render pixels. When the pixel is loaded, the coroutine can be resumed again and it can render the loaded pixel. Let's see how this performs:
 
<div id='coroutine-ideal'></div>
{{% center %}}{{% text s="0.9" color="#808080" %}}
*Concurrent loading of image*
{{% /text %}}{{% /center %}}
It's still significantly faster than the synchronous code but is slower than parallel code. The key difference between this and parallelism is that no two coroutines can run at the same time. While loading pixels, each coroutine is suspended and waiting for its pixel to load, so all the pixels can be loaded at the same time. But while a coroutine is rendering its pixel, all other coroutines are suspended and only a single pixel can be rendered at a time. This happens because all coroutines essentially run on a single thread, so the suspended coroutines have to wait for the currently active coroutine to either suspend or finish its work so that they can get a chance to run.

This is the reason why while writing a concurrent program, all the functions *must* be coroutines. Even if one of the functions is not a coroutine, it can block the main thread while its running and you won't be able to take full advantage of concurrency. 

And as for the same question we asked in multithreading, Why not use coroutines everywhere? Because:

- Not all programs have parts that have to wait for external things to finish, which makes suspending a function useless
- Most of the major libraries are not built using coroutines, which doesn't help much with the "all functions *must* be coroutines" thing

And now for the side by side comparison you have been waiting for:
<div id='all-ideal-left' class='triple'></div><div id='all-ideal-middle' class='triple'></div><div id='all-ideal-right' class='triple'></div>
{{% center %}}{{% text s="0.9" color="#808080" %}}
*Synchronous vs Concurrent vs Parallel*
{{% /text %}}{{% /center %}}
## Ideal world vs Real world

Although all the animations above were an accurate portrayal of both techniques, they were slightly misleading, as they exist in the ideal world. This is similar to those high school physics problems where we assumed things like air resistance and curvature of the earth didn't exist because it lets us focus on the main principles rather than get bogged down in too many details.

In practice, it depends on a lot of factors how many threads you can create but there is almost no case where spawning 10,000 threads is a good idea. Each thread needs memory (the default thread stack size in Linux is 8MB), and the number of threads will depend on how much ram you have. Threads also have some overhead, things like creation, destruction, and scheduling, which gets more difficult the more threads you have. And if your CPU has only 4 cores, only 4 threads will be running truly parallel at any time. The OS will have to schedule all other threads and switch between them for each core, which will also add a lot of complexity and negate the advantages of having thousands of threads.

Similarly, coroutines are just functions so we can easily create thousands of them for each task. But this is also not desirable in many situations as coroutines are generally used for tasks that depend on external sources, like downloading a webpage. Sending a huge amount of concurrent requests to a single server will likely result in either acting as a DDoS attack and harming the server or a ban of your IP from their servers for an arbitrary time period. 

## Which technique should I use then?

Generally to overcome these real-life limitations people use stuff like [pools](https://en.wikipedia.org/wiki/Thread_pool), [locks](https://en.wikipedia.org/wiki/Lock_(computer_science)), [semaphores](https://en.wikipedia.org/wiki/Semaphore_(programming)) to limit the number of threads and coroutines. To make our animations depict a slightly better representation of the real world, we will limit the maximum number of coroutines and thread we can run to 8. Now let's look at a few different situation to see where each technique shines:

If your work involves mostly **I/O bound** tasks, like if our image only required loading, then coroutines are just as fast as threads. Coroutines are even preferred over threads because they don't require any additional overhead, run in a single thread and you can easily create thousands of them.

<div id='io-bound-left' class='double'></div><div id='io-bound-right' class='double'></div>
{{% center %}}{{% text s="0.9" color="#808080" %}}
*Concurrent vs Parallel: I/O bound with max 8 threads*
{{% /text %}}{{% /center %}}
As visible in the above animation, there is negligible difference between the two. The code to download 50 web pages from earlier is an example of i/o bound work, and the output shows that coroutines gave the best result.

If your work involves mostly **CPU bound** tasks, which can be represented by our image only needing rendering, then threads far outperform coroutines. This is obvious as coroutines can only run one at a time and would take the same time as synchronous code. Here, suspending a coroutine won't give us an advantage. 
 
<div id='cpu-bound-left' class='double'></div><div id='cpu-bound-right' class='double'></div>
{{% center %}}{{% text s="0.9" color="#808080" %}}
*Concurrent vs Parallel: CPU bound with max 8 threads*
{{% /text %}}{{% /center %}}
Here it can easily be seen that parallel code is much better. The Fibonacci code from earlier is an example of CPU bound work.

Or maybe if your work is a mix of both **I/O and CPU bound**, then deciding which one is better will depend on the specifics of your program. 

<div id='both-bound-left' class='double'></div><div id='both-bound-right' class='double'></div>
{{% center %}}{{% text s="0.9" color="#808080" %}}
*Concurrent vs Parallel: General case with max 8 threads*
{{% /text %}}{{% /center %}}
If you observe the above animation, you will see that coroutines are far more comparable to threads in performance when real-world limits are applied as compared to the ideal case animations.

And lastly, most applications work just fine with synchronous code! Unless your code is getting too slow, you don't need to parallelize your code or convert everything to coroutines. Even if it gets slow, you should probably look first into refactoring or profiling your code before trying these techniques. That said, if your problem comes under whats known as [embarrassingly parallel](https://en.wikipedia.org/wiki/Embarrassingly_parallel) problems, then you should definitely take a look at parallelization :D

## A caveat: multithreading in python

If you have never worked in python or never plan to, this section might not be relevant to you. But I use python as one of my main languages, So I wanted to explain this briefly.

In python, the difference between multiprocessing and multithreading actually matters. Multithreading in python is a tricky business. As almost everyone knows, there exists a thing called **G**lobal **I**nterpreter **L**ock (or GIL) in [CPython](https://github.com/python/cpython), the reference implementation of python. Basically, GIL is a global lock that prevents threads from running in more than one core, severely limiting the potential of threads and it exists because CPython's memory management is not thread-safe.

GIL is also the reason why threads performed so poorly in our Fibonacci example earlier.

Threads in python still work great for most stuff that's I/O bound, but if GIL is acting as a bottleneck you can still work around it. One option is to use processes instead of threads if you don't mind a little additional overhead caused by them. We can create multiple child processes to the main python process, and each will have its own GIL and can run parallel to other child processes. processes in python can be implemented using 
the [multiprocessing](https://docs.python.org/2/library/multiprocessing.html) library or the recently added awesome library [concurrent.futures](https://docs.python.org/3/library/concurrent.futures.html).

Also, there exist other implementations of Python that don't have GIL altogether, like [Jython](http://www.jython.org/) or [IronPython](http://ironpython.net/)

If you want to learn more about GIL in detail, I would highly recommend [David Beazley's talk](https://www.youtube.com/watch?v=ph374fJqFPE) on the topic.

## Conclusion

In conclusion, both parallelism and concurrency are very powerful techniques that can greatly reduce the runtime of your programs, but both have their own very specific areas where they can be used efficiently. Hopefully after reading this article you have a better understanding of how parallelism and concurrency work.

I would highly appreciate any feedback, suggestions or criticism you might have regarding this article. Feel free to message me on twitter at [@oddanomaly](https://twitter.com/oddanomaly) or leave a comment below.

The code for all the examples and animations used in this article is open source and can be found here: [github repo](https://github.com/Arsh23/cvsp)

**Further reading:**  
- Rob Pike's [Concurrency Is Not Parallelism](https://www.youtube.com/watch?v=cN_DpYBzKso) video  
- [Excellent talks by David Beazley](http://www.dabeaz.com/talks.html)  
- Another great talk by A. Jesse Davis: [video](https://www.youtube.com/watch?v=7sCu4gEjH5I), [blog](https://emptysqua.re/blog/links-for-how-python-coroutines-work/)  
- Relevant chapters of the book [Fluent Python](http://shop.oreilly.com/product/0636920032519.do)  
- The [chapter on coroutines](http://aosabook.org/en/500L/a-web-crawler-with-asyncio-coroutines.html) of the [AOSA](http://aosabook.org/en/index.html) book  

**Images used:**  
https://hangmoon.deviantart.com/art/City-648372768  
https://alpha.wallhaven.cc/wallpaper/567889
