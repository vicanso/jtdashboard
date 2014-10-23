module = angular.module 'jt.service.utils', []


module.factory 'jtUtils', ['$http', '$rootScope', ($http, $rootScope) -> 

  utils =
    now : Date.now || ->
      new Date().getTime()
    nextTick : (fn) ->
      setTimeout fn, 0
    pluck : (arr, key) ->
      result = []
      angular.forEach arr, (tmp) ->
        result.push tmp[key]
      result
    throttle : (func, wait, options) ->
      context = undefined
      args = undefined
      result = undefined
      timeout = null
      previous = 0
      options = {}  unless options
      later = ->
        previous = if options.leading is false then 0 else utils.now()
        timeout = null
        result = func.apply(context, args)
        context = args = null  unless timeout
        return

      ->
        now = utils.now()
        previous = now  if not previous and options.leading is false
        remaining = wait - (now - previous)
        context = @
        args = arguments
        if remaining <= 0 or remaining > wait
          clearTimeout timeout
          timeout = null
          previous = now
          result = func.apply(context, args)
          context = args = null  unless timeout
        else timeout = setTimeout(later, remaining)  if not timeout and options.trailing isnt false
        result
    debounce : (func, wait, immediate) ->
      timeout = undefined
      args = undefined
      context = undefined
      timestamp = undefined
      result = undefined
      later = ->
        last = utils.now() - timestamp
        if last < wait and last > 0
          timeout = setTimeout(later, wait - last)
        else
          timeout = null
          unless immediate
            result = func.apply(context, args)
            context = args = null  unless timeout
        return

      ->
        context = @
        args = arguments
        timestamp = utils.now()
        callNow = immediate and not timeout
        timeout = setTimeout(later, wait)  unless timeout
        if callNow
          result = func.apply(context, args)
          context = args = null
        result
    uuid : ->
      str = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace /[xy]/g, (c) ->
        r = Math.random() * 16 | 0
        if c == 'x'
          v = r
        else
          v = r & 0x3|0x8

        v.toString 16
      str

    memoize : (fn, hasher) ->
      memo = {}
      queues = {}
      hasher = hasher or (x) ->
        x

      memoized = ->
        args = Array::slice.call(arguments)
        callback = args.pop()
        key = hasher.apply(null, args)
        if key of memo
          utils.nextTick ->
            callback.apply null, memo[key]
            return

        else if key of queues
          queues[key].push callback
        else
          queues[key] = [callback]
          fn.apply null, args.concat([->
            memo[key] = arguments
            q = queues[key]
            delete queues[key]

            i = 0
            l = q.length

            while i < l
              q[i].apply null, arguments
              i++
            return
          ])
        return

      memoized.memo = memo
      memoized.unmemoized = fn
      memoized

    sortedIndex : (arr, v, compare) ->
      low = 0
      high = arr?.length || low
      while low < high
        mid = (low + high) >>> 1
        if compare
          if compare(arr[mid], v) < 0
            low = mid + 1
          else
            high = mid
        else if arr[mid] < v
          low = mid + 1
        else
          high = mid
      low

  utils
]
