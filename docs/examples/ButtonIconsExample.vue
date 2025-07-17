<template>
  <div class="space-y-4">
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <Button><Plus class="mr-2 h-4 w-4" />Add Item</Button>
      <Button variant="primary"><Download class="mr-2 h-4 w-4" />Download</Button>
      <Button variant="success"><Check class="mr-2 h-4 w-4" />Complete</Button>
      <Button variant="warning"><AlertTriangle class="mr-2 h-4 w-4" />Warning</Button>
      <Button variant="danger"><Trash class="mr-2 h-4 w-4" />Delete</Button>
      <Button variant="info"><Info class="mr-2 h-4 w-4" />Info</Button>
      <Button variant="outline"><Settings class="mr-2 h-4 w-4" />Settings</Button>
      <Button variant="ghost"><Edit class="mr-2 h-4 w-4" />Edit</Button>
    </div>
  </div>
</template>

<script setup>
import { Button } from '@/uikit/components/ui/button'
import { Plus, Download, Check, AlertTriangle, Trash, Info, Settings, Edit } from 'lucide-vue-next'
</script>
