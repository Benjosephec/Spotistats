import { useRef, useState } from 'react'
import { useHistoryStore } from '@/store/historyStore'
import { StreamingEntry } from '@/types/history'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UploadCloud, X, FileJson } from 'lucide-react'

export default function UploadPage() {
  const { entries, fileNames, addEntries, reset } = useHistoryStore()
  const [dragging, setDragging] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const processFiles = (files: FileList | null) => {
    if (!files) return
    setErrors([])

    Array.from(files).forEach((file) => {
      if (fileNames.includes(file.name)) {
        setErrors((prev) => [...prev, `"${file.name}" est déjà chargé.`])
        return
      }

      if (!file.name.endsWith('.json')) {
        setErrors((prev) => [...prev, `"${file.name}" n'est pas un fichier JSON.`])
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string)

          if (!Array.isArray(parsed)) {
            setErrors((prev) => [...prev, `"${file.name}" : le JSON doit être un tableau.`])
            return
          }

          const entries = parsed as StreamingEntry[]
          addEntries(entries, file.name)
        } catch {
          setErrors((prev) => [...prev, `"${file.name}" : impossible de parser le JSON.`])
        }
      }
      reader.readAsText(file)
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    processFiles(e.dataTransfer.files)
  }

  const totalTracks = entries.filter((e) => e.master_metadata_track_name !== null).length

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8 bg-background">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Spotistats</h1>
        <p className="text-muted-foreground mt-1">
          Dépose ton historique Spotify pour visualiser tes stats
        </p>
      </div>

      <Card
        className={`w-full max-w-lg border-2 border-dashed cursor-pointer transition-colors
          ${dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50'}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <UploadCloud className={`w-12 h-12 ${dragging ? 'text-primary' : 'text-muted-foreground'}`} />
          <div className="text-center">
            <p className="font-medium">Dépose tes fichiers ici</p>
            <p className="text-sm text-muted-foreground">ou clique pour les sélectionner</p>
            <p className="text-xs text-muted-foreground mt-1">fichiers de types josn uniquement</p>
          </div>
        </CardContent>
      </Card>

      <input
        ref={inputRef}
        type="file"
        accept=".json"
        multiple
        className="hidden"
        onChange={(e) => processFiles(e.target.files)}
      />

      {errors.length > 0 && (
        <div className="w-full max-w-lg space-y-1">
          {errors.map((err, i) => (
            <p key={i} className="text-sm text-destructive">{err}</p>
          ))}
        </div>
      )}

      {fileNames.length > 0 && (
        <div className="w-full max-w-lg space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Fichiers chargés</p>
            <Button variant="ghost" size="sm" onClick={reset} className="text-destructive hover:text-destructive">
              <X className="w-4 h-4 mr-1" /> Tout effacer
            </Button>
          </div>

          {fileNames.map((name) => (
            <div key={name} className="flex items-center gap-2 p-3 rounded-md border bg-muted/40">
              <FileJson className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm flex-1 truncate">{name}</span>
              <Badge variant="secondary">OK</Badge>
            </div>
          ))}

          <div className="text-sm text-muted-foreground text-right">
            {totalTracks.toLocaleString()} écoutes chargées
          </div>

          <Button className="w-full">
            Voir mes stats →
          </Button>
        </div>
      )}
    </div>
  )
}