import { describe, it, expect, beforeEach } from 'vitest'
import { StepState } from '@/core/composables/StepState'

describe('StepState', () => {
  let stepper

  beforeEach(() => {
    stepper = new StepState('/')
  })

  describe.skip('basic interactive checks', () => {
    it('should make sense to use', () => {
      const a = stepper.push('a')
      const a1 = a.push()
      const a2 = a.push()

      const b = stepper.push('b')
      const c = stepper.push('c')
      console.log(stepper.treeDiagram)

      stepper.reset()
      console.log(a2.path)
      console.log(stepper.depth)
      console.log(a2.depth)
      console.log('tree depth at', stepper.treeDepth)
      console.log('tree depth at', a.treeDepth)
      console.log('tree depth at', a2.treeDepth)
      console.log('tree depth at', b.treeDepth)
      stepper.reset()
      console.log(stepper.next()) // 0
      console.log(stepper.next()) // 1
      console.log(stepper.next()) // b
      console.log(stepper.next()) // c
      console.log(stepper.next()) //null
      console.log(stepper.next()) //null
      console.log(stepper.prev()) // b
      console.log(stepper.prev()) // a
    })

    it('should allow nested states', () => {
      stepper.push('level1')
      stepper['level1'].push('level2')
      stepper['level1']['level2'].push('level3')
      stepper['level1']['level2']['level3'].push('level4')
      expect(stepper['level1']).toBeTruthy()
      expect(stepper['level1']['level2']).toBeTruthy()
      expect(stepper['level1']['level2']['level3']).toBeTruthy()
      expect(stepper['level1']['level2']['level3']['level4']).toBeTruthy()
    })
  })

  describe('basic operations', () => {
    it('should create a root state with correct initial values', () => {
      expect(stepper.id).toBe('/')
      expect(stepper.states).toEqual([])
      expect(stepper.index).toBe(0)
      expect(stepper.parent).toBeNull()
      expect(stepper.depth).toBe(0)
    })

    it('should push new named states correctly', () => {
      const child = stepper.push('child')
      expect(stepper.states.length).toBe(1)
      expect(child.id).toBe('child')
      expect(child.parent).toBe(stepper)
      expect(stepper.depth).toBe(0)
      expect(stepper.treeDepth).toBe(1)
      expect(child.depth).toBe(1)
      expect(child.treeDepth).toBe(0)
    })

    it('should throw an error when pushing duplicate value', () => {
      stepper.push('test')
      expect(() => stepper.push('test')).toThrow(/State id already exists/)

      // Verify auto-generated values still work
      expect(() => stepper.push()).not.toThrow()
      expect(() => stepper.push()).not.toThrow()

      // Verify different values still work
      expect(() => stepper.push('B')).not.toThrow()
    })

    it('should allow pushing null values', () => {
      const state = stepper.push()
      expect(state).toBeTruthy()
    })

    it('should push new auto-numbered states correctly', () => {
      const child = stepper.push()
      expect(stepper.states.length).toBe(1)
      const child2 = stepper.push()
      expect(stepper.states.length).toBe(2)
      expect(child.id).toBe(0)
      expect(child.parent).toBe(stepper)
      expect(child2.id).toBe(1)
      expect(child2.parent).toBe(stepper)
    })
  })

  describe('insert operations', () => {
    it('should insert at beginning with index 0', () => {
      const root = new StepState()
      const first = root.push('first')
      const inserted = root.insert('inserted', 0)

      expect(root.states[0].id).toBe('inserted')
      expect(root.states[1].id).toBe('first')
      expect(inserted.parent).toBe(root)
    })

    it('should insert at beginning with index 0 and data', () => {
      const root = new StepState()
      const first = root.push('first')
      const inserted = root.insert('inserted', 0, 'data')

      expect(root.states[0].id).toBe('inserted')
      expect(root.states[0].data).toBe('data')
    })

    it('should insert at end with -1', () => {
      const root = new StepState()
      const first = root.push('first')
      const inserted = root.insert('inserted', -1)

      expect(root.states[0].id).toBe('first')
      expect(root.states[1].id).toBe('inserted')
      expect(inserted.parent).toBe(root)
    })

    it('should insert at end with -1 for a list of more items', () => {
      const root = new StepState()
      const first = root.push('first')
      const second = root.push('second')
      const inserted = root.insert('inserted', -1)

      expect(root.states[0].id).toBe('first')
      expect(root.states[1].id).toBe('second')
      expect(root.states[2].id).toBe('inserted')
      expect(inserted.parent).toBe(root)
    })

    it('should insert at second to end with -2', () => {
      const root = new StepState()
      const first = root.push('first')
      const second = root.push('second')
      const inserted = root.insert('inserted', -2)

      expect(root.states[0].id).toBe('first')
      expect(root.states[1].id).toBe('inserted')
      expect(root.states[2].id).toBe('second')
      expect(inserted.parent).toBe(root)
    })

    it('should insert at second position with index 1', () => {
      const root = new StepState()
      const first = root.push('first')
      const third = root.push('third')
      const inserted = root.insert('inserted', 1)

      expect(root.states[0].id).toBe('first')
      expect(root.states[1].id).toBe('inserted')
      expect(root.states[2].id).toBe('third')
      expect(inserted.parent).toBe(root)
    })

    it('should handle inserting beyond list length gracefully', () => {
      const root = new StepState()
      const first = root.push('first')
      // insert at a positive index that is beyond the list length
      const inserted = root.insert('inserted', 5)

      expect(root.states[0].id).toBe('first')
      expect(root.states[1].id).toBe('inserted')
      expect(inserted.parent).toBe(root)
    })

    it('should handle excessively negative indices gracefully', () => {
      const root = new StepState()
      const first = root.push('first')
      const inserted = root.insert('inserted', -5)

      expect(root.states[0].id).toBe('inserted')
      expect(root.states[1].id).toBe('first')
      expect(inserted.parent).toBe(root)
    })

    it('should not allow inserting duplicate values', () => {
      const root = new StepState()
      root.push('A')

      expect(() => root.insert('A', 0)).toThrow(/State id already exists/)
      expect(() => root.insert('A', -1)).toThrow(/State id already exists/)
    })

    it('should auto-generate values when value is null', () => {
      const root = new StepState()
      root.push('first')
      const inserted = root.insert(null, 0)

      expect(inserted.id).toBe(1) // Should use states.length as value
    })

    it('should maintain currentPath when inserting at current position', () => {
      const root = new StepState()
      const first = root.push('first')
      const second = root.push('second')

      // Initially at first leaf
      expect(root.currentPath).toEqual(['first'])

      // Insert new node at current position
      const inserted = root.insert('inserted', 0)
      expect(root.currentPath).toEqual(['inserted'])
    })

    it('should maintain currentPath when inserting between existing nodes', () => {
      const root = new StepState()
      const first = root.push('first')
      const second = root.push('second')
      const third = root.push('third')

      // Move to second node
      root.next()
      expect(root.currentPath).toEqual(['second'])

      // Insert between first and second
      const inserted = root.insert('inserted', 1)
      expect(root.currentPath).toEqual(['inserted'])
    })

    it('should maintain currentPath when inserting at end', () => {
      const root = new StepState()
      const first = root.push('first')
      const second = root.push('second')

      // Move to second node
      root.next()
      expect(root.currentPath).toEqual(['second'])

      // Insert at end
      const inserted = root.insert('inserted', -1)
      expect(root.currentPath).toEqual(['second'])
    })

    it('should maintain currentPath when inserting into nested structure', () => {
      const root = new StepState()
      const first = root.push('first')
      const firstChild = first.push('firstChild')
      const second = root.push('second')

      // Move to firstChild
      //root.next()
      expect(root.currentPath).toEqual(['first', 'firstChild'])

      // Insert new sibling to firstChild
      const inserted = first.insert('inserted', 0)
      expect(root.currentPath).toEqual(['first', 'inserted'])
    })

    it('should maintain currentPath when inserting multiple nodes', () => {
      const root = new StepState()
      const first = root.push('first')
      const second = root.push('second')

      // Move to first node
      expect(root.currentPath).toEqual(['first'])

      // Insert multiple nodes at current position
      const inserted1 = root.insert('inserted1', 0)
      expect(root.currentPath).toEqual(['inserted1'])

      const inserted2 = root.insert('inserted2', 0)
      expect(root.currentPath).toEqual(['inserted2'])
    })

    it('should not allow values containing hyphens', () => {
      const root = new StepState()
      expect(() => root.insert('test-value')).toThrow(/State id cannot contain hyphens/)
      expect(() => root.insert('value-with-hyphens')).toThrow(/State id cannot contain hyphens/)
      expect(() => root.insert('value-')).toThrow(/State id cannot contain hyphens/)
      expect(() => root.insert('-value')).toThrow(/State id cannot contain hyphens/)
    })

    it('should allow values without hyphens', () => {
      const root = new StepState()
      expect(() => root.insert('testvalue')).not.toThrow()
      expect(() => root.insert('value_with_underscores')).not.toThrow()
      expect(() => root.insert('value.with.dots')).not.toThrow()
      expect(() => root.insert('value:with:colons')).not.toThrow()
    })

    it('should allow auto-generated numeric values', () => {
      const root = new StepState()
      expect(() => root.insert(null)).not.toThrow()
      expect(() => root.insert()).not.toThrow()
    })
  })

  describe('push operations', () => {
    it('should do the same thing as insert when index is -1', () => {
      const root = new StepState()
      root.push('hi')

      const root2 = new StepState()
      root2.insert('hi', -1)
      expect(root.states[0].id).toBe(root2.states[0].id)
    })

    it('should call insert when pushing', () => {
      const root = new StepState()
      const insertSpy = vi.spyOn(root, 'insert')

      root.push('test')

      expect(insertSpy).toHaveBeenCalledWith('test', -1, null)
      expect(insertSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('depth operations', () => {
    it('should get correct depth', () => {
      const child = stepper.push('child')
      const grandchild = child.push('grandchild')
      expect(grandchild.depth).toBe(2)
    })
  })

  describe('path operations', () => {
    // remember that the path is the path from the root to the current node
    // by following the parent pointers
    // currentPath is the path from the root to the current node by following the index
    // the path is an array of values
    // the paths is a string of values separated by hyphens

    describe('.path and .paths', () => {
      it('should get empty path for root node', () => {
        expect(stepper.path).toEqual([])
        expect(stepper.paths).toBe('')
      })

      it('should get correct .path and .paths for single level', () => {
        const child = stepper.push('child')
        expect(child.path).toEqual(['child'])
        expect(child.paths).toBe('child')
      })

      it('should get correct .path and .paths for multiple levels', () => {
        const child = stepper.push('child')
        const grandchild = child.push('grandchild')
        const greatgrandchild = grandchild.push('great')

        expect(greatgrandchild.path).toEqual(['child', 'grandchild', 'great'])
        expect(greatgrandchild.paths).toBe('child-grandchild-great')
      })

      it('should handle numeric values in path', () => {
        const child = stepper.push() // Will be 0 (number)
        const grandchild = child.push('named')

        expect(grandchild.path).toEqual([0, 'named']) // Changed from ['0', 'named']
        expect(grandchild.paths).toBe('0-named')
      })
    })

    describe('.currentPath', () => {
      it('should get correct current path', () => {
        const child = stepper.push('child')
        const grandchild = child.push('grandchild')
        // Navigate through the tree to set indices
        stepper.next() // moves to child
        stepper['child'].next() // moves to grandchild
        expect(grandchild.currentPaths).toBe('child-grandchild')
      })

      it('should get current path correctly', () => {
        const child1 = stepper.push('child1')
        child1.push('grandchild1')
        stepper.push('child2')

        // Initially at first child
        expect(stepper.currentPath).toEqual(['child1', 'grandchild1'])

        // Navigate through the tree
        stepper.next() // moves to child2
        expect(stepper.currentPath).toEqual(['child2'])
      })

      it('should get current path correctly when called on a child', () => {
        const child1 = stepper.push('child1')
        child1.push('grandchild1')
        stepper.push('child2')

        // Initially at first child
        expect(stepper.currentPath).toEqual(['child1', 'grandchild1'])
        expect(child1.currentPath).toEqual(['child1', 'grandchild1'])

        // Navigate through the tree
        stepper.next() // moves to child2
        expect(stepper.currentPath).toEqual(['child2'])
        expect(child1.currentPath).toEqual(['child2'])
      })

      it('should get current path string correctly with mixed named and indexed nodes', () => {
        const child1 = stepper.push('child1')
        const autoChild1 = child1.push() // Will be '0'
        const autoChild2 = child1.push() // Will be '1'
        const child2 = stepper.push('child2')
        const namedChild = child2.push('named')

        expect(stepper.currentPaths).toBe('child1-0')

        stepper.next() // moves to second auto-indexed child
        expect(stepper.currentPaths).toBe('child1-1')

        stepper.next() // moves to named child
        expect(stepper.currentPaths).toBe('child2-named')
      })
    })
  })

  describe('reset operations', () => {
    it('should reset state correctly on the root', () => {
      const child = stepper.push('child')
      child.push('grandchild')
      stepper.next()
      stepper.reset()
      expect(stepper.index).toBe(0)
      expect(child.index).toBe(0)
    })

    it('should reset the stepper to the root', () => {
      stepper.push()
      stepper.push()
      stepper.push()
      stepper.push()
      stepper.push()

      stepper.next()
      expect(stepper.currentPath).toEqual([1])

      stepper.next()
      expect(stepper.currentPath).toEqual([2])
    })

    it('should reset state correctly on a child/subtree', () => {
      const child1 = stepper.push('child1')
      const child2 = stepper.push('child2')
      const child3 = stepper.push('child3')
      const child4 = stepper.push('child4')
      const grandchild1 = child1.push('grandchild1')
      const grandchild2 = child1.push('grandchild2')
      const grandchild3 = child1.push('grandchild3')
      const grandchild4 = child2.push('grandchild4')
      const grandchild5 = child2.push('grandchild5')
      const grandchild6 = child3.push('grandchild6')
      const grandchild7 = child4.push('grandchild7')
      // add greatgrandchild to some of the grandchildren
      const greatgrandchild1 = grandchild1.push('greatgrandchild1')
      const greatgrandchild2 = grandchild2.push('greatgrandchild2')
      const greatgrandchild3 = grandchild3.push('greatgrandchild3')
      const greatgrandchild4 = grandchild3.push('greatgrandchild4')
      const greatgrandchild6 = grandchild7.push('greatgrandchild6')
      const greatgrandchild7 = grandchild7.push('greatgrandchild7')

      expect(stepper.currentPath).toEqual(['child1', 'grandchild1', 'greatgrandchild1'])

      stepper.next()
      expect(stepper.currentPath).toEqual(['child1', 'grandchild2', 'greatgrandchild2'])

      stepper.next()
      expect(stepper.currentPath).toEqual(['child1', 'grandchild3', 'greatgrandchild3'])

      stepper.next()
      expect(stepper.currentPath).toEqual(['child1', 'grandchild3', 'greatgrandchild4'])

      stepper.next()
      expect(stepper.currentPath).toEqual(['child2', 'grandchild4'])

      stepper.next()
      expect(stepper.currentPath).toEqual(['child2', 'grandchild5'])
    })
  })

  describe('goTo operations', () => {
    it('should reset to a leaf node correctly', () => {
      const child1 = stepper.push('child1')
      const child2 = stepper.push('child2')
      const grandchild1 = child1.push('grandchild1')
      const grandchild2 = child1.push('grandchild2')

      // Reset to a leaf node
      stepper.goTo(['child1', 'grandchild1'])
      expect(stepper.currentPath).toEqual(['child1', 'grandchild1'])
    })

    it('should reset to a non-leaf node and traverse to leftmost leaf', () => {
      const child1 = stepper.push('child1')
      const child2 = stepper.push('child2')
      const grandchild1 = child1.push('grandchild1')
      const grandchild2 = child1.push('grandchild2')
      const grandchild3 = child2.push('grandchild3')

      stepper.next()
      stepper.next()
      stepper.next()
      stepper.next()
      // Reset to a non-leaf node
      stepper.goTo(['child1'])
      expect(stepper.currentPath).toEqual(['child1', 'grandchild1'])
    })

    it('should handle numeric path values correctly', () => {
      const child1 = stepper.push()
      const child2 = stepper.push()
      const grandchild1 = child1.push()
      const grandchild2 = child1.push()

      // Reset using numeric values
      stepper.goTo([0, 0])
      expect(stepper.currentPath).toEqual([0, 0])
    })

    it('should handle mixed string and numeric path values', () => {
      const child1 = stepper.push('child1')
      const child2 = stepper.push()
      const grandchild1 = child1.push('grandchild1')
      const grandchild2 = child1.push()

      // Reset using mixed values
      stepper.goTo(['child1', 'grandchild1'])
      expect(stepper.currentPath).toEqual(['child1', 'grandchild1'])
    })

    it('should handle hyphen-separated string paths', () => {
      const child1 = stepper.push('child1')
      const child2 = stepper.push('child2')
      const grandchild1 = child1.push('grandchild1')
      const grandchild2 = child1.push('grandchild2')

      // Reset using hyphen-separated string
      stepper.goTo('child1-grandchild1')
      expect(stepper.currentPath).toEqual(['child1', 'grandchild1'])
    })

    it('should throw error for invalid path', () => {
      const child1 = stepper.push('child1')
      const child2 = stepper.push('child2')

      // Try to reset to non-existent path
      expect(() => stepper.goTo(['nonexistent'])).toThrow('Invalid path')
    })

    it('should handle deep nested paths correctly', () => {
      const child1 = stepper.push('child1')
      const grandchild1 = child1.push('grandchild1')
      const greatgrandchild1 = grandchild1.push('greatgrandchild1')
      const greatgrandchild2 = grandchild1.push('greatgrandchild2')

      // Reset to deepest leaf
      stepper.goTo(['child1', 'grandchild1', 'greatgrandchild1'])
      expect(stepper.currentPath).toEqual(['child1', 'grandchild1', 'greatgrandchild1'])
    })

    it('should handle root path correctly', () => {
      const child1 = stepper.push('child1')
      const child2 = stepper.push('child2')

      // Reset to root
      stepper.goTo(['/'])
      expect(stepper.currentPath).toEqual(['child1'])
    })

    it('should maintain state after multiple goTo calls', () => {
      const child1 = stepper.push('child1')
      const child2 = stepper.push('child2')
      const grandchild1 = child1.push('grandchild1')
      const grandchild2 = child1.push('grandchild2')

      // Reset to different paths
      stepper.goTo(['child1', 'grandchild1'])
      expect(stepper.currentPath).toEqual(['child1', 'grandchild1'])

      stepper.goTo(['child2'])
      expect(stepper.currentPath).toEqual(['child2'])
    })

    it('should correctly update pathdata after goTo', () => {
      const child1 = stepper.push('child1')
      const child2 = stepper.push('child2')
      const grandchild1 = child1.push('grandchild1')
      const grandchild2 = child1.push('grandchild2')
      const grandchild3 = child2.push('grandchild3')

      // Set data on various nodes
      child1.data = { level: 1 }
      grandchild1.data = { level: 2 }
      grandchild2.data = { level: 3 }
      child2.data = { level: 1 }
      grandchild3.data = { level: 4 }

      // Initially at first path
      expect(stepper.pathdata).toEqual([{ level: 1 }, { level: 2 }])

      // Reset to a different path
      stepper.goTo(['child2', 'grandchild3'])
      expect(stepper.pathdata).toEqual([{ level: 1 }, { level: 4 }])

      // Reset to another path
      stepper.goTo(['child1', 'grandchild2'])
      expect(stepper.pathdata).toEqual([{ level: 1 }, { level: 3 }])

      // Reset to a path with no data
      stepper.goTo(['child1'])
      expect(stepper.pathdata).toEqual([{ level: 1 }, { level: 2 }])
    })
  })

  describe('navigation', () => {
    it('should reset to initial state', () => {
      stepper.push('first')
      stepper.push('second')
      stepper.push('third')
      stepper.next()
      stepper.next()
      stepper.reset()
      expect(stepper.next().id).toBe('second')
    })

    it('should navigate forward correctly', () => {
      const child1 = stepper.push('child1')
      const child2 = stepper.push('child2')

      expect(stepper.next().id).toBe('child2')
      expect(stepper.next()).toBeNull()
    })

    it('should navigate backward correctly', () => {
      const child1 = stepper.push('child1')
      const child2 = stepper.push('child2')

      stepper.next() // child1
      stepper.next() // child2

      expect(stepper.prev().id).toBe('child1')
      expect(stepper.prev()).toBeNull()
    })

    it('should correctly report hasNext state', () => {
      const child1 = stepper.push('child1')
      const child2 = stepper.push('child2')
      const grandchild = child1.push('grandchild')

      // Initially at root
      expect(stepper.hasNext()).toBe(true)

      // Move to last node
      stepper.next() // moves to child2
      expect(stepper.hasNext()).toBe(false)
    })

    it('should correctly report hasPrev state', () => {
      const child1 = stepper.push('child1')
      const child2 = stepper.push('child2')
      const grandchild = child1.push('grandchild')

      // Initially at root
      expect(stepper.hasPrev()).toBe(false)

      // Move to middle
      stepper.next() // moves to grandchild
      stepper.next() // moves to child2
      expect(stepper.hasPrev()).toBe(true)

      // Move back to start
      stepper.prev() // moves to grandchild
      stepper.prev() // moves to start
      expect(stepper.hasPrev()).toBe(false)
    })

    it('should navigate a complex tree correctly', () => {
      // create a complex tree with 4 children of the
      // root node with various depths for each child
      const child1 = stepper.push('child1')
      const child2 = stepper.push('child2')
      const child3 = stepper.push('child3')
      const child4 = stepper.push('child4')
      const grandchild1 = child1.push('grandchild1')
      const grandchild2 = child1.push('grandchild2')
      const grandchild3 = child1.push('grandchild3')
      const grandchild4 = child2.push('grandchild4')
      const grandchild5 = child2.push('grandchild5')
      const grandchild6 = child3.push('grandchild6')
      const grandchild7 = child4.push('grandchild7')
      // add greatgrandchild to some of the grandchildren
      const greatgrandchild1 = grandchild1.push('greatgrandchild1')
      const greatgrandchild2 = grandchild2.push('greatgrandchild2')
      const greatgrandchild3 = grandchild3.push('greatgrandchild3')
      const greatgrandchild4 = grandchild3.push('greatgrandchild4')
      const greatgrandchild6 = grandchild7.push('greatgrandchild6')
      const greatgrandchild7 = grandchild7.push('greatgrandchild7')
      //console.log(stepper.treeDiagram)

      // now navigate through the tree
      expect(stepper.next().id).toBe('greatgrandchild2')
      expect(stepper.next().id).toBe('greatgrandchild3')
      expect(stepper.next().id).toBe('greatgrandchild4')
      expect(stepper.next().id).toBe('grandchild4')
      expect(stepper.next().id).toBe('grandchild5')
      expect(stepper.next().id).toBe('grandchild6')
      expect(stepper.next().id).toBe('greatgrandchild6')
      expect(stepper.next().id).toBe('greatgrandchild7')
      expect(stepper.next()).toBeNull()

      // now navigate backward
      //expect(stepper.prev()).toBe('greatgrandchild7')  // this is not output because we stop on last node
      expect(stepper.prev().id).toBe('greatgrandchild6')
      expect(stepper.prev().id).toBe('grandchild6')
      expect(stepper.prev().id).toBe('grandchild5')
      expect(stepper.prev().id).toBe('grandchild4')
      expect(stepper.prev().id).toBe('greatgrandchild4')
      expect(stepper.prev().id).toBe('greatgrandchild3')
      expect(stepper.prev().id).toBe('greatgrandchild2')
      expect(stepper.prev().id).toBe('greatgrandchild1')
      expect(stepper.prev()).toBeNull()
      expect(stepper.next().id).toBe('greatgrandchild2')
    })

    it('should peek next correctly', () => {
      const child1 = stepper.push('child1')
      const child2 = stepper.push('child2')

      expect(stepper.peekNext().id).toBe('child2')
      expect(stepper.index).toBe(0) // Should not change position
    })

    it('should peek prev correctly', () => {
      const child1 = stepper.push('child1')
      const child2 = stepper.push('child2')

      stepper.next() // child1
      stepper.next() // child2

      expect(stepper.peekPrev().id).toBe('child1')
      expect(stepper.index).toBe(1) // Should not change position
    })
  })

  describe('proxy behavior', () => {
    it('should allow chained access to nested states', () => {
      stepper.push('parent')
      stepper['parent'].push('child')
      expect(stepper['parent']).toBeTruthy()
      expect(stepper['parent']['child']).toBeTruthy()
    })

    it('should support deep nested state access and manipulation', () => {
      // Create a deep chain: level1 -> level2 -> level3 -> level4
      stepper.push('level1')
      stepper['level1'].push('level2')
      stepper['level1']['level2'].push('level3')
      stepper['level1']['level2']['level3'].push('level4')

      // Verify each level exists and can be accessed
      expect(stepper['level1']).toBeTruthy()
      expect(stepper['level1']['level2']).toBeTruthy()
      expect(stepper['level1']['level2']['level3']).toBeTruthy()
      expect(stepper['level1']['level2']['level3']['level4']).toBeTruthy()

      // Verify we can add a sibling at a deep level
      stepper['level1']['level2']['level3'].push('level4sibling')
      expect(stepper['level1']['level2']['level3']['level4sibling']).toBeTruthy()

      // Verify non-existent paths at deep levels return undefined
      expect(stepper['level1']['level2']['nonexistent']).toBeUndefined()
      expect(stepper['level1']['level2']['level3']['nonexistent']).toBeUndefined()
    })

    it('should return undefined for non-existent paths', () => {
      expect(stepper['nonexistent']).toBeUndefined()
    })
  })

  describe('root reference', () => {
    it('should set _root to self when creating root instance', () => {
      const root = new StepState()
      expect(root._root).toStrictEqual(root)
    })

    it('should maintain reference to root through nested instances', () => {
      const root = new StepState()
      root.push('level1')
      root['level1'].push('level2')
      root['level1']['level2'].push('level3')

      // Verify each level has reference to the root
      expect(root['level1']._root).toStrictEqual(root)
      expect(root['level1']['level2']._root).toStrictEqual(root)
      expect(root['level1']['level2']['level3']._root).toStrictEqual(root)
    })

    it('should allow operations at root level from nested instances', () => {
      const root = new StepState()
      root.push('A')
      root.push('B')

      // Access root's treeDiagram from a nested instance
      const nestedDiagram = root['A']._root.treeDiagram
      const rootDiagram = root.treeDiagram

      expect(nestedDiagram).toBe(rootDiagram)
    })

    it('should get root node correctly using root getter', () => {
      const root = new StepState()
      root.push('level1')
      root['level1'].push('level2')
      root['level1']['level2'].push('level3')

      // Test root getter at different levels
      expect(root.root).toStrictEqual(root)
      expect(root['level1'].root).toStrictEqual(root)
      expect(root['level1']['level2'].root).toStrictEqual(root)
      expect(root['level1']['level2']['level3'].root).toStrictEqual(root)
    })
  })

  describe('clear operations', () => {
    it('should clear all states and reset properties', () => {
      const root = new StepState()
      root.push('A')
      root['A'].push('B')
      root['A']['B'].push('C')
      root.data = { test: 'data' }

      // Clear the state
      root.clear()

      // Verify all properties are reset
      expect(root.states).toEqual([])
      expect(root.index).toBe(0)
      expect(root.data).toEqual({})
      expect(root._root).toStrictEqual(root)
    })

    it('should clear nested states recursively', () => {
      const root = new StepState()
      root.push('A')
      root['A'].push('B')
      root['A']['B'].push('C')
      root['A'].data = { test: 'data' }

      // Clear a nested state
      root['A'].clear()

      // Verify the cleared state and its children are reset
      expect(root['A'].states).toEqual([])
      expect(root['A'].index).toBe(0)
      expect(root['A'].data).toEqual({})
      expect(root['A']._root).toStrictEqual(root)
    })

    it('should maintain root reference after clearing', () => {
      const root = new StepState()
      root.push('A')
      root['A'].push('B')

      // Clear a nested state
      root['A'].clear()

      // Verify root reference is maintained
      expect(root['A']._root).toStrictEqual(root)
    })
  })

  describe('cleartree operations', () => {
    it('should clear all states but preserve data', () => {
      const root = new StepState()
      root.push('A')
      root['A'].push('B')
      root['A']['B'].push('C')
      root.data = { test: 'data' }

      // Clear the tree
      root.clearTree()

      // Verify states are cleared but data is preserved
      expect(root.states).toEqual([])
      expect(root.index).toBe(0)
      expect(root.data).toEqual({ test: 'data' })
    })

    it('should clear nested states recursively but preserve data', () => {
      const root = new StepState()
      root.push('A')
      root['A'].push('B')
      root['A']['B'].push('C')
      root['A'].data = { test: 'data' }

      // Clear a nested state
      root['A'].clearTree()

      // Verify the cleared state and its children are reset but data is preserved
      expect(root['A'].states).toEqual([])
      expect(root['A'].index).toBe(0)
      expect(root['A'].data).toEqual({ test: 'data' })
    })

    it('should maintain root reference after clearing tree', () => {
      const root = new StepState()
      root.push('A')
      root['A'].push('B')

      // Clear a nested state
      root['A'].clearTree()

      // Verify root reference is maintained
      expect(root['A']._root).toStrictEqual(root)
    })
  })

  describe('node access', () => {
    it('should get node by index and value correctly', () => {
      const child1 = stepper.push('child1')
      const child2 = stepper.push('child2')
      const child3 = stepper.push('child3')

      // Test getting by index
      expect(stepper.getNode(0)).toBe(child1)
      expect(stepper.getNode(1)).toBe(child2)
      expect(stepper.getNode(2)).toBe(child3)
      expect(stepper.getNode(3)).toBeNull()

      // Test getting by value
      expect(stepper.getNode('child1')).toBe(child1)
      expect(stepper.getNode('child2')).toBe(child2)
      expect(stepper.getNode('child3')).toBe(child3)
      expect(stepper.getNode('nonexistent')).toBeNull()
    })
  })

  describe.skip('delete operations', () => {
    it('should handle delete operations correctly', () => {
      expect(true).toBe(false)
    })
  })

  describe('leaf nodes', () => {
    it('should get the leaf nodes correctly', () => {
      const child1 = stepper.push('child1')
      const child2 = stepper.push('child2')
      const child3 = stepper.push('child3')
      const child4 = stepper.push('child4')
      const grandchild1 = child1.push('grandchild1')
      const grandchild2 = child1.push('grandchild2')
      const grandchild3 = child1.push('grandchild3')
      const grandchild4 = child2.push('grandchild4')
      const grandchild5 = child2.push('grandchild5')
      const grandchild6 = child3.push('grandchild6')
      const grandchild7 = child4.push('grandchild7')
      // add greatgrandchild to some of the grandchildren
      const greatgrandchild1 = grandchild1.push('greatgrandchild1')
      const greatgrandchild2 = grandchild2.push('greatgrandchild2')
      const greatgrandchild3 = grandchild3.push('greatgrandchild3')
      const greatgrandchild4 = grandchild3.push('greatgrandchild4')
      const greatgrandchild6 = grandchild7.push('greatgrandchild6')
      const greatgrandchild7 = grandchild7.push('greatgrandchild7')

      expect(stepper.leafNodes).toEqual([
        'child1-grandchild1-greatgrandchild1',
        'child1-grandchild2-greatgrandchild2',
        'child1-grandchild3-greatgrandchild3',
        'child1-grandchild3-greatgrandchild4',
        'child2-grandchild4',
        'child2-grandchild5',
        'child3-grandchild6',
        'child4-grandchild7-greatgrandchild6',
        'child4-grandchild7-greatgrandchild7',
      ])
    })
  })

  describe('leaf node operations', () => {
    it('should correctly identify leaf nodes', () => {
      const child1 = stepper.push('child1')
      const child2 = stepper.push('child2')
      const grandchild1 = child1.push('grandchild1')
      const grandchild2 = child1.push('grandchild2')

      // Root node is not a leaf
      expect(stepper.isLeaf).toBe(false)

      // Child nodes with children are not leaves
      expect(child1.isLeaf).toBe(false)
      expect(child2.isLeaf).toBe(true)

      // Grandchild nodes without children are leaves
      expect(grandchild1.isLeaf).toBe(true)
      expect(grandchild2.isLeaf).toBe(true)
    })

    it('should correctly identify first leaf node', () => {
      const child1 = stepper.push('child1')
      const child2 = stepper.push('child2')
      const grandchild1 = child1.push('grandchild1')
      const grandchild2 = child1.push('grandchild2')
      const grandchild3 = child2.push('grandchild3')

      // First leaf should be grandchild1
      expect(grandchild1.isFirstLeaf).toBe(true)
      expect(grandchild2.isFirstLeaf).toBe(false)
      expect(grandchild3.isFirstLeaf).toBe(false)
    })

    it('should handle SOS and EOS nodes in first leaf check', () => {
      const sos = stepper.push('SOS')
      const child1 = stepper.push('child1')
      const child2 = stepper.push('child2')
      const eos = stepper.push('EOS')
      const grandchild1 = child1.push('grandchild1')
      const grandchild2 = child1.push('grandchild2')

      // SOS and EOS nodes should not be considered first leaves
      expect(sos.isFirstLeaf).toBe(false)
      expect(eos.isFirstLeaf).toBe(false)

      // First actual leaf should be grandchild1
      expect(grandchild1.isFirstLeaf).toBe(true)
      expect(grandchild2.isFirstLeaf).toBe(false)
    })

    it('should handle empty tree in first leaf check', () => {
      // Root node is not a leaf
      expect(stepper.isLeaf).toBe(true)
      expect(stepper.isFirstLeaf).toBe(false) // SOS is not a leaf
    })

    it('should handle single node tree in first leaf check', () => {
      const child = stepper.push('child')
      expect(child.isLeaf).toBe(true)
      expect(child.isFirstLeaf).toBe(true)
    })

    it('should handle complex tree structure in first leaf check', () => {
      const child1 = stepper.push('child1')
      const child2 = stepper.push('child2')
      const grandchild1 = child1.push('grandchild1')
      const grandchild2 = child1.push('grandchild2')
      const grandchild3 = child2.push('grandchild3')
      const greatgrandchild1 = grandchild1.push('greatgrandchild1')
      const greatgrandchild2 = grandchild1.push('greatgrandchild2')

      // First leaf should be greatgrandchild1
      expect(greatgrandchild1.isFirstLeaf).toBe(true)
      expect(greatgrandchild2.isFirstLeaf).toBe(false)
      expect(grandchild2.isFirstLeaf).toBe(false)
      expect(grandchild3.isFirstLeaf).toBe(false)
    })
  })

  describe('visualization', () => {
    it('should generate tree representation', () => {
      stepper.push('A')
      stepper['A'].push('B')
      stepper['A']['B'].push('C')

      const diagram = stepper.treeDiagram
      expect(diagram).toBeTypeOf('string')
      expect(diagram).toContain('A')
      expect(diagram).toContain('B')
      expect(diagram).toContain('C')
    })

    it('should render a tree diagram correctly', () => {
      const child1 = stepper.push('child1')
      const child2 = stepper.push('child2')
      const child3 = stepper.push('child3')
      const child4 = stepper.push('child4')
      const grandchild1 = child1.push('grandchild1')
      const grandchild2 = child1.push('grandchild2')
      const grandchild3 = child1.push('grandchild3')
      const grandchild4 = child2.push('grandchild4')
      const grandchild5 = child2.push('grandchild5')
      const grandchild6 = child3.push('grandchild6')
      const grandchild7 = child4.push('grandchild7')
      // add greatgrandchild to some of the grandchildren
      const greatgrandchild1 = grandchild1.push('greatgrandchild1')
      const greatgrandchild2 = grandchild2.push('greatgrandchild2')
      const greatgrandchild3 = grandchild3.push('greatgrandchild3')
      const greatgrandchild4 = grandchild3.push('greatgrandchild4')
      const greatgrandchild6 = grandchild7.push('greatgrandchild6')
      const greatgrandchild7 = grandchild7.push('greatgrandchild7')
      //console.log(stepper.treeDiagram)
      expect(stepper.treeDiagram).toBe(
        '/' +
          '\n├── child1' +
          '\n│   ├── grandchild1' +
          '\n│   │   └── greatgrandchild1' +
          '\n│   ├── grandchild2' +
          '\n│   │   └── greatgrandchild2' +
          '\n│   └── grandchild3' +
          '\n│       ├── greatgrandchild3' +
          '\n│       └── greatgrandchild4' +
          '\n├── child2' +
          '\n│   ├── grandchild4' +
          '\n│   └── grandchild5' +
          '\n├── child3' +
          '\n│   └── grandchild6' +
          '\n└── child4' +
          '\n    └── grandchild7' +
          '\n        ├── greatgrandchild6' +
          '\n        └── greatgrandchild7' +
          '\n'
      )
    })

    it('should render a sub-tree diagram correctly', () => {
      const child1 = stepper.push('child1')
      const child2 = stepper.push('child2')
      const child3 = stepper.push('child3')
      const child4 = stepper.push('child4')
      const grandchild1 = child1.push('grandchild1')
      const grandchild2 = child1.push('grandchild2')
      const grandchild3 = child1.push('grandchild3')
      const grandchild4 = child2.push('grandchild4')
      const grandchild5 = child2.push('grandchild5')
      const grandchild6 = child3.push('grandchild6')
      const grandchild7 = child4.push('grandchild7')
      // add greatgrandchild to some of the grandchildren
      const greatgrandchild1 = grandchild1.push('greatgrandchild1')
      const greatgrandchild2 = grandchild2.push('greatgrandchild2')
      const greatgrandchild3 = grandchild3.push('greatgrandchild3')
      const greatgrandchild4 = grandchild3.push('greatgrandchild4')
      const greatgrandchild6 = grandchild7.push('greatgrandchild6')
      const greatgrandchild7 = grandchild7.push('greatgrandchild7')
      //console.log(grandchild7.treeDiagram)
      expect(grandchild7.treeDiagram).toBe(
        '└── grandchild7' + '\n    ├── greatgrandchild6' + '\n    └── greatgrandchild7' + '\n'
      )
    })

    it('should get the leaf nodes correctly', () => {
      const child1 = stepper.push('child1')
      const child2 = stepper.push('child2')
      const child3 = stepper.push('child3')
      const child4 = stepper.push('child4')
      const grandchild1 = child1.push('grandchild1')
      const grandchild2 = child1.push('grandchild2')
      const grandchild3 = child1.push('grandchild3')
      const grandchild4 = child2.push('grandchild4')
      const grandchild5 = child2.push('grandchild5')
      const grandchild6 = child3.push('grandchild6')
      const grandchild7 = child4.push('grandchild7')
      // add greatgrandchild to some of the grandchildren
      const greatgrandchild1 = grandchild1.push('greatgrandchild1')
      const greatgrandchild2 = grandchild2.push('greatgrandchild2')
      const greatgrandchild3 = grandchild3.push('greatgrandchild3')
      const greatgrandchild4 = grandchild3.push('greatgrandchild4')
      const greatgrandchild6 = grandchild7.push('greatgrandchild6')
      const greatgrandchild7 = grandchild7.push('greatgrandchild7')

      expect(stepper.leafNodes).toEqual([
        'child1-grandchild1-greatgrandchild1',
        'child1-grandchild2-greatgrandchild2',
        'child1-grandchild3-greatgrandchild3',
        'child1-grandchild3-greatgrandchild4',
        'child2-grandchild4',
        'child2-grandchild5',
        'child3-grandchild6',
        'child4-grandchild7-greatgrandchild6',
        'child4-grandchild7-greatgrandchild7',
      ])
    })
  })

  describe('serialization', () => {
    it('should serialize and deserialize correctly', () => {
      const child = stepper.push('child')
      child.push('grandchild')
      stepper.next() // Advance to create some state

      const serialized = stepper.json
      const newState = new StepState('root')
      newState.loadFromJSON(serialized)

      expect(newState.json).toEqual(serialized)
    })

    it('should preserve navigation state after serialization', () => {
      // Create a simple tree and advance through it
      const child1 = stepper.push('child1')
      const child2 = stepper.push('child2')
      const child3 = stepper.push('child3')
      const child4 = stepper.push('child4')
      stepper.next() // to child2
      stepper.next() // to child3

      // Serialize and deserialize
      const serialized = stepper.json
      const newState = new StepState('/')
      newState.loadFromJSON(serialized)

      // Verify navigation works as expected
      expect(newState.next().id).toBe('child4') // Can go backwards
      expect(newState.prev().id).toBe('child3') // Can go backwards
      expect(newState.next().id).toBe('child4') // Can go forwards
      expect(newState.next()).toBeNull() // Preserves end of sequence
    })
  })

  describe('data management', () => {
    it('should initialize with empty object data', () => {
      expect(stepper.data).toEqual({})
    })

    it('should set and get key-value pairs using data getter/setter', () => {
      // Set a single key-value pair
      stepper.data.test = 'value'
      expect(stepper.data.test).toBe('value')
      expect(stepper.data).toEqual({ test: 'value' })

      // Set multiple key-value pairs
      stepper.data.key1 = 42
      stepper.data.key2 = true
      expect(stepper.data).toEqual({
        test: 'value',
        key1: 42,
        key2: true,
      })

      // Update existing key
      stepper.data.test = 'new value'
      expect(stepper.data.test).toBe('new value')
      expect(stepper.data).toEqual({
        test: 'new value',
        key1: 42,
        key2: true,
      })

      // Set nested object
      stepper.data.nested = { foo: 'bar' }
      expect(stepper.data.nested.foo).toBe('bar')
      expect(stepper.data).toEqual({
        test: 'new value',
        key1: 42,
        key2: true,
        nested: { foo: 'bar' },
      })
    })

    it('should maintain data when setting multiple key-value pairs', () => {
      // Set initial data
      stepper.data = { initial: 'value' }

      // Add new key-value pair
      stepper.data.newKey = 'new value'
      expect(stepper.data).toEqual({
        initial: 'value',
        newKey: 'new value',
      })

      // Update existing key
      stepper.data.initial = 'updated'
      expect(stepper.data).toEqual({
        initial: 'updated',
        newKey: 'new value',
      })
    })

    it('should handle nested data updates', () => {
      // Set initial nested data
      stepper.data = { nested: { foo: 'bar' } }

      // Update nested value
      stepper.data.nested.foo = 'baz'
      expect(stepper.data.nested.foo).toBe('baz')

      // Add new nested key
      stepper.data.nested.newKey = 42
      expect(stepper.data.nested).toEqual({
        foo: 'baz',
        newKey: 42,
      })
    })

    it('should store and retrieve data', () => {
      const data = { test: 'value' }
      stepper.data = data
      expect(stepper.data).toEqual(data)
    })

    it('should store data during push', () => {
      const data = { test: 'value' }
      stepper.push('first', data)
      expect(stepper['first'].data).toEqual(data)
    })

    it('should update existing data', () => {
      stepper.push('first', { test: 'value' })
      const newData = { updated: 'value' }
      stepper['first'].data = newData
      expect(stepper['first'].data).toEqual(newData)
    })

    it('should set data at specified path', () => {
      stepper.push('first')
      stepper['first'].push('second')
      const data = { test: 'value' }
      stepper.setDataAtPath(['first', 'second'], data)
      expect(stepper['first']['second'].data).toEqual(data)
    })

    it('should set data using string path', () => {
      stepper.push('first')
      stepper['first'].push('second')
      const data = { test: 'value' }
      stepper.setDataAtPath('first-second', data)
      expect(stepper['first']['second'].data).toEqual(data)
    })

    it('should throw error for invalid path in setDataAtPath', () => {
      expect(() => stepper.setDataAtPath('nonexistent', {})).toThrow('Invalid path')
    })

    it('should require object data in setDataAtPath', () => {
      stepper.push('first')
      stepper['first'].push('second')

      // Should accept objects
      expect(() => stepper.setDataAtPath(['first', 'second'], {})).not.toThrow()
      expect(() => stepper.setDataAtPath(['first', 'second'], { test: 'value' })).not.toThrow()

      // Should reject non-objects
      expect(() => stepper.setDataAtPath(['first', 'second'], null)).toThrow('Data must be an object')
      expect(() => stepper.setDataAtPath(['first', 'second'], undefined)).toThrow('Data must be an object')
      expect(() => stepper.setDataAtPath(['first', 'second'], 42)).toThrow('Data must be an object')
      expect(() => stepper.setDataAtPath(['first', 'second'], 'string')).toThrow('Data must be an object')
      expect(() => stepper.setDataAtPath(['first', 'second'], true)).toThrow('Data must be an object')
      expect(() => stepper.setDataAtPath(['first', 'second'], [])).toThrow('Data must be an object')
    })

    it('should allow null data', () => {
      stepper.data = { test: 'value' }
      stepper.data = null
      expect(stepper.data).toBeNull()
    })

    it('should return empty object for nodes without data', () => {
      stepper.push('first')
      expect(stepper['first'].data).toEqual({})
    })

    describe('datapath', () => {
      it('should collect data from all nodes along current path', () => {
        // Set up a path with data
        const child1 = stepper.push('child1')
        const child2 = stepper.push('child2')
        const grandchild = child1.push('grandchild')

        child1.data = { level: 1 }
        grandchild.data = { level: 2 }

        // Navigate to grandchild
        //stepper.next() // moves to grandchild

        // Should get data from child1 and grandchild
        expect(stepper.pathdata).toEqual([{ level: 1 }, { level: 2 }])
      })

      it('should return empty array for path with no data', () => {
        stepper.push('first')
        stepper['first'].push('second')
        stepper['first']['second'].push('third')

        //stepper.next() // move to grandchild
        //stepper['first'].next()
        //stepper['first']['second'].next()

        const pathData = stepper['first']['second']['third'].pathdata
        expect(pathData).toEqual([])
      })

      it('should skip nodes without data', () => {
        const child1 = stepper.push('child1')
        const child2 = stepper.push('child2')
        const grandchild = child1.push('grandchild')

        // Only set data on grandchild
        grandchild.data = { data: 'test' }

        //stepper.next() // moves to grandchild

        // Should only get grandchild data
        expect(stepper.pathdata).toEqual([{ data: 'test' }])
      })

      it('should ignore root node data', () => {
        stepper.data = { root: 'data' }
        const child = stepper.push('child')
        child.data = { child: 'data' }

        stepper.next() // move to child

        // Should not include root data
        expect(stepper.pathdata).toEqual([{ child: 'data' }])
      })

      it('should handle complex paths with multiple data points', () => {
        const child1 = stepper.push('child1')
        const child2 = stepper.push('child2')
        const grandchild1 = child1.push('grandchild1')
        const greatgrandchild = grandchild1.push('greatgrandchild')

        child1.data = { level: 1 }
        grandchild1.data = { level: 2 }
        greatgrandchild.data = { level: 3 }
        child2.data = { unused: 'data' } // This shouldn't appear in result

        // Navigate to greatgrandchild
        //stepper.next() // moves to greatgrandchild

        // Should get data from the path child1 -> grandchild1 -> greatgrandchild
        expect(stepper.pathdata).toEqual([{ level: 1 }, { level: 2 }, { level: 3 }])
      })

      it('should return empty array when no data exists along path', () => {
        const child = stepper.push('child')
        const grandchild = child.push('grandchild')

        //stepper.next() // move to grandchild

        expect(stepper.pathdata).toEqual([])
      })
    })

    describe('currentData', () => {
      it('should return data from current leaf node', () => {
        const child1 = stepper.push('child1')
        const child2 = stepper.push('child2')
        const grandchild = child1.push('grandchild')

        // Set data on various nodes
        child1.data = { level: 1 }
        grandchild.data = { level: 2 }
        child2.data = { level: 3 }

        // Initially at grandchild
        expect(stepper.currentData).toEqual({ level: 2 })

        // Navigate to child2
        stepper.next()
        expect(stepper.currentData).toEqual({ level: 3 })
      })

      it('should return empty object for leaf node without data', () => {
        const child = stepper.push('child')
        const grandchild = child.push('grandchild')

        // No data set on any nodes
        expect(stepper.currentData).toEqual({})
      })

      it('should update when navigating through the tree', () => {
        const child1 = stepper.push('child1')
        const child2 = stepper.push('child2')
        const grandchild1 = child1.push('grandchild1')
        const grandchild2 = child1.push('grandchild2')

        // Set data on nodes
        grandchild1.data = { data: 'first' }
        grandchild2.data = { data: 'second' }
        child2.data = { data: 'third' }

        // Initially at grandchild1
        expect(stepper.currentData).toEqual({ data: 'first' })

        // Navigate to grandchild2
        stepper.next()
        expect(stepper.currentData).toEqual({ data: 'second' })

        // Navigate to child2
        stepper.next()
        expect(stepper.currentData).toEqual({ data: 'third' })
      })

      it('should handle null data in leaf node', () => {
        const child = stepper.push('child')
        child.data = null
        expect(stepper.currentData).toBeNull()
      })

      it('should return root data when at root level', () => {
        stepper.data = { root: 'data' }
        expect(stepper.currentData).toEqual({ root: 'data' })
      })
    })

    describe('setDataAtPath', () => {
      it('should set data at a specific path', () => {
        stepper.push('parent')
        stepper['parent'].push('child')
        stepper.setDataAtPath('parent-child', { data: 'test' })
      })

      it('should set data at specified path', () => {
        stepper.push('first')
        stepper['first'].push('second')
        const data = { test: 'value' }
        stepper.setDataAtPath(['first', 'second'], data)
        expect(stepper['first']['second'].data).toEqual(data)
      })

      it('should set data using string path', () => {
        stepper.push('first')
        stepper['first'].push('second')
        const data = { test: 'value' }
        stepper.setDataAtPath('first-second', data)
        expect(stepper['first']['second'].data).toEqual(data)
      })

      it('should throw error for invalid path in setDataAtPath', () => {
        expect(() => stepper.setDataAtPath('nonexistent', {})).toThrow('Invalid path')
      })
    })
  })

  describe('data serialization', () => {
    let stepper

    beforeEach(() => {
      stepper = new StepState('/')
    })

    it('should serialize and deserialize simple data types', () => {
      const testData = {
        string: 'test',
        number: 42,
        boolean: true,
        null: null,
        array: [1, 2, 3],
        nestedObject: { a: 1, b: 2 },
      }

      stepper.data = testData
      const serialized = stepper.json
      const newState = new StepState('/')
      newState.loadFromJSON(serialized)

      expect(newState.data).toEqual(testData)
    })

    it('should handle data serialization in nested nodes', () => {
      const child = stepper.push('child')
      child.data = { childData: 'test' }
      const grandchild = child.push('grandchild')
      grandchild.data = { grandchildData: 123 }

      const serialized = stepper.json
      const newState = new StepState('/')
      newState.loadFromJSON(serialized)

      expect(newState.getNode('child').data).toEqual({ childData: 'test' })
      expect(newState.getNode('child').getNode('grandchild').data).toEqual({ grandchildData: 123 })
    })

    it('should reload a complex table and set the paths correctly', () => {
      const child1 = stepper.push('child1')
      const child2 = stepper.push('child2')
      const child3 = stepper.push('child3')
      const child4 = stepper.push('child4')
      const grandchild1 = child1.push('grandchild1')
      const grandchild2 = child1.push('grandchild2')
      const grandchild3 = child1.push('grandchild3')
      const grandchild4 = child2.push('grandchild4')
      const grandchild5 = child2.push('grandchild5')
      const grandchild6 = child3.push('grandchild6')
      const grandchild7 = child4.push('grandchild7')
      // add greatgrandchild to some of the grandchildren
      const greatgrandchild1 = grandchild1.push('greatgrandchild1')
      const greatgrandchild2 = grandchild2.push('greatgrandchild2')
      const greatgrandchild3 = grandchild3.push('greatgrandchild3')
      const greatgrandchild4 = grandchild3.push('greatgrandchild4')
      const greatgrandchild6 = grandchild7.push('greatgrandchild6')
      const greatgrandchild7 = grandchild7.push('greatgrandchild7')

      stepper.next()
      stepper.next()
      stepper.next()
      stepper.next()
      expect(stepper.currentPaths).toEqual('child2-grandchild4')

      const serialized = stepper.json
      const newState = new StepState('/')
      newState.loadFromJSON(serialized)

      expect(newState.currentPaths).toEqual('child2-grandchild4')
      expect(grandchild4.paths).toEqual('child2-grandchild4')

      newState.next()
      newState.next()
      expect(newState.currentPaths).toEqual('child3-grandchild6')
      expect(grandchild6.paths).toEqual('child3-grandchild6')

      // Verify parent references are maintained after deserialization
      expect(newState.parent).toBeNull() // Root state should have null parent
      expect(newState['child1'].parent).toBe(newState)
    })

    it('should handle non-serializable data types', () => {
      const nonSerializableData = {
        function: () => console.log('hello'),
        vueComponent: { template: '<div></div>', setup: () => ({}) },
        domElement: typeof window !== 'undefined' ? document.createElement('div') : {},
        regexp: /test/,
        undefined: undefined,
      }

      stepper.data = nonSerializableData
      const serialized = stepper.json
      const newState = new StepState('/')
      newState.loadFromJSON(serialized)

      const deserializedData = newState.data
      expect(deserializedData.function).toBeUndefined()
      expect(deserializedData.undefined).toBeUndefined()
      // DOM elements and RegExp are skipped entirely during serialization
      expect(deserializedData.domElement).toBeUndefined()
      expect(deserializedData.regexp).toBeUndefined()
    })
  })
})
